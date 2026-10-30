from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..models import Customer, Order, OrderItem, Saree
from .inventory_service import adjust_stock


def money(value: Decimal) -> Decimal:
    return value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def create_order(db: Session, payload, source: str = 'Store') -> Order:
    if not payload.customer_name or not payload.customer_phone:
        raise HTTPException(status_code=400, detail='Customer name and phone are required')

    sarees = {}
    for item in payload.items:
        saree = db.execute(select(Saree).where(Saree.id == item.saree_id).with_for_update()).scalar_one_or_none()
        if not saree:
            raise HTTPException(status_code=404, detail=f'Saree {item.saree_id} not found')
        if saree.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f'Insufficient stock for "{saree.name}". Available: {saree.stock}, Requested: {item.quantity}')
        sarees[item.saree_id] = saree

    subtotal = money(sum((sarees[item.saree_id].price * item.quantity for item in payload.items), Decimal('0')))
    discount = min(money(payload.discount), subtotal)
    tax = money((subtotal - discount) * Decimal('0.05'))
    total = money(subtotal - discount + tax)

    if source == 'Online':
        status = 'New'
        log_reason = 'Online Order'
        adjusted_by = payload.customer_name
    else:
        status = 'Pending' if payload.payment_method == 'COD' else 'Completed'
        log_reason = 'Store Walk-in Sale'
        adjusted_by = getattr(payload, 'staff_name', 'Store Cashier') or 'Store Cashier'

    order = Order(
        id=f'ord-{uuid4().hex[:12]}',
        order_number=f'ORD-{datetime.now(timezone.utc):%Y%m%d}-{uuid4().hex[:6].upper()}',
        invoice_number=f'INV-{datetime.now(timezone.utc):%Y%m%d}-{uuid4().hex[:6].upper()}',
        customer_id=payload.customer_id,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        subtotal=subtotal,
        discount=discount,
        tax=tax,
        total_amount=total,
        payment_method=payload.payment_method,
        status=status,
        source=source,
        notes=payload.notes or '',
    )
    db.add(order)
    for item in payload.items:
        db.add(OrderItem(id=f'item-{uuid4().hex[:12]}', order_id=order.id, saree_id=item.saree_id, quantity=item.quantity, price=sarees[item.saree_id].price))
        adjust_stock(db, saree_id=item.saree_id, movement_type='OUT', quantity=item.quantity, reason=log_reason, notes=f'Order {order.order_number} - {payload.customer_name}', adjusted_by=adjusted_by)
    if payload.customer_id:
        customer = db.execute(select(Customer).where(Customer.id == payload.customer_id).with_for_update()).scalar_one_or_none()
        if customer:
            customer.total_orders += 1
            customer.total_spend = money(customer.total_spend + total)
    db.flush()
    return db.execute(select(Order).options(joinedload(Order.items)).where(Order.id == order.id)).unique().scalar_one()
