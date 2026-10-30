from uuid import uuid4

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from ..auth import create_access_token, hash_password, verify_password
from ..deps import CurrentCustomer, CurrentUser, DbSession
from ..models import Customer, Order
from ..schemas.schemas import CustomerAuthOut, CustomerLoginResponse, CustomerRegister, LoginRequest, OrderCreate, OrderOut
from ..services.order_service import create_order

router = APIRouter(prefix='/customer-auth', tags=['Customer Auth'])
shop_router = APIRouter(prefix='/shop', tags=['Shop Orders'])


@router.post('/register', response_model=CustomerLoginResponse)
def register_customer(payload: CustomerRegister, db: DbSession):
    email = payload.email.strip().lower()
    if db.execute(select(Customer).where(func.lower(Customer.email) == email)).scalar_one_or_none():
        raise HTTPException(status_code=409, detail='Email already registered')

    customer = Customer(
        id=f'cust-{uuid4().hex[:12]}',
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        city='',
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return {'customer': {'id': customer.id, 'name': customer.name, 'email': customer.email, 'phone': customer.phone}, 'token': create_access_token(customer.id, 'customer')}


@router.post('/login', response_model=CustomerLoginResponse)
def login_customer(payload: LoginRequest, db: DbSession):
    email = payload.email.strip().lower()
    customer = db.execute(select(Customer).where(Customer.email == email)).scalar_one_or_none()
    if not customer or not verify_password(payload.password, customer.password_hash):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    return {'customer': {'id': customer.id, 'name': customer.name, 'email': customer.email, 'phone': customer.phone}, 'token': create_access_token(customer.id, 'customer')}


@router.get('/me', response_model=CustomerAuthOut)
def me_customer(customer: CurrentCustomer):
    return customer


@router.get('/orders', response_model=list[OrderOut])
def my_orders(db: DbSession, customer: CurrentCustomer):
    orders = db.execute(select(Order).options(joinedload(Order.items)).where(Order.customer_id == customer.id).order_by(Order.date.desc())).unique().scalars().all()
    return orders


@shop_router.post('/orders', response_model=OrderOut, status_code=201)
def create_customer_order(payload: OrderCreate, db: DbSession, customer: CurrentCustomer):
    payload.customer_id = customer.id
    payload.customer_name = customer.name
    payload.customer_phone = customer.phone
    try:
        order = create_order(db, payload, source='Online')
        db.commit()
        return order
    except Exception:
        db.rollback()
        raise


@shop_router.get('/orders/mine', response_model=list[OrderOut])
def my_shop_orders(db: DbSession, customer: CurrentCustomer):
    return my_orders(db, customer)
