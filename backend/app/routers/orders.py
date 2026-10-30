from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.orm import joinedload

from ..deps import CurrentUser, DbSession
from ..models import Customer, Order
from ..schemas.schemas import NewOrdersSummaryOut, OrderCreate, OrderOut, OrderStatusUpdate
from ..services.inventory_service import adjust_stock
from ..services.order_service import create_order, money

router = APIRouter(prefix='/orders', tags=['Orders'])

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    'New': {'Accepted', 'Rejected'},
    'Accepted': {'Packed', 'Cancelled'},
    'Packed': {'Shipped', 'Cancelled'},
    'Shipped': {'Delivered'},
    'Pending': {'Completed', 'Cancelled'},
    'Completed': {'Cancelled'},
}


@router.get('', response_model=list[OrderOut])
def list_orders(
    db: DbSession,
    _: CurrentUser,
    search: str | None = None,
    source: str | None = None,
    status: str | None = None,
    paymentMethod: str | None = None,
):
    query = select(Order).options(joinedload(Order.items))
    if search:
        query = query.where(
            or_(
                Order.order_number.ilike(f'%{search}%'),
                Order.customer_name.ilike(f'%{search}%'),
                Order.customer_phone.ilike(f'%{search}%'),
                Order.invoice_number.ilike(f'%{search}%'),
            )
        )
    if source and source != 'All':
        query = query.where(Order.source.ilike(source))
    if status and status != 'All':
        query = query.where(Order.status.ilike(status))
    if paymentMethod and paymentMethod != 'All':
        query = query.where(Order.payment_method.ilike(paymentMethod))

    query = query.order_by(Order.date.desc())
    return db.execute(query).unique().scalars().all()


@router.get('/summary/new-count', response_model=NewOrdersSummaryOut)
def get_new_orders_summary(db: DbSession, _: CurrentUser):
    new_count = (
        db.execute(
            select(func.count(Order.id)).where(
                Order.status == 'New',
                Order.source == 'Online',
            )
        ).scalar_one()
        or 0
    )

    latest_orders = (
        db.execute(
            select(Order)
            .where(Order.status == 'New', Order.source == 'Online')
            .order_by(Order.date.desc())
            .limit(5)
        )
        .scalars()
        .all()
    )

    return {
        'newCount': new_count,
        'latest': [
            {
                'orderNumber': o.order_number,
                'customerName': o.customer_name,
                'totalAmount': o.total_amount,
                'date': o.date,
            }
            for o in latest_orders
        ],
    }


@router.get('/{order_id}', response_model=OrderOut)
def get_order(order_id: str, db: DbSession, _: CurrentUser):
    order = (
        db.execute(
            select(Order)
            .options(joinedload(Order.items))
            .where((Order.id == order_id) | (Order.order_number == order_id))
        )
        .unique()
        .scalar_one_or_none()
    )
    if not order:
        raise HTTPException(404, 'Order not found')
    return order


@router.post('', response_model=OrderOut, status_code=201)
def post_order(payload: OrderCreate, db: DbSession, _: CurrentUser):
    try:
        order = create_order(db, payload, source='Store')
        db.commit()
        return order
    except Exception:
        db.rollback()
        raise


@router.patch('/{order_id}/status', response_model=OrderOut)
def update_status(order_id: str, payload: OrderStatusUpdate, db: DbSession, user: CurrentUser):
    order = (
        db.execute(
            select(Order)
            .options(joinedload(Order.items))
            .where((Order.id == order_id) | (Order.order_number == order_id))
            .with_for_update()
        )
        .unique()
        .scalar_one_or_none()
    )
    if not order:
        raise HTTPException(404, 'Order not found')

    allowed = ALLOWED_TRANSITIONS.get(order.status, set())
    if payload.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from '{order.status}' to '{payload.status}'",
        )

    if payload.status == 'Rejected':
        if not payload.rejection_reason or not payload.rejection_reason.strip():
            raise HTTPException(
                status_code=400,
                detail='Rejection reason is required when rejecting an order',
            )
        order.rejection_reason = payload.rejection_reason.strip()

    try:
        if order.status not in ('Rejected', 'Cancelled') and payload.status in ('Rejected', 'Cancelled'):
            reason = 'Order Rejected' if payload.status == 'Rejected' else 'Order Cancelled'
            for item in order.items:
                adjust_stock(
                    db,
                    saree_id=item.saree_id,
                    movement_type='IN',
                    quantity=item.quantity,
                    reason=reason,
                    notes=f'Restock on {payload.status.lower()} of {order.order_number}',
                    adjusted_by=user.name,
                )
            if order.customer_id:
                customer = db.execute(
                    select(Customer).where(Customer.id == order.customer_id).with_for_update()
                ).scalar_one_or_none()
                if customer:
                    customer.total_orders = max(0, customer.total_orders - 1)
                    customer.total_spend = max(
                        Decimal('0'),
                        money(customer.total_spend - order.total_amount),
                    )

        order.status = payload.status
        order.handled_by = user.name
        order.handled_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(order)
        return order
    except Exception:
        db.rollback()
        raise
