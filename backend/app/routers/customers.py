from uuid import uuid4

from fastapi import APIRouter, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import joinedload

from ..deps import CurrentUser, DbSession
from ..models import Customer, Order
from ..schemas.schemas import CustomerCreate, CustomerOut, CustomerUpdate

router = APIRouter(prefix='/customers', tags=['Customers'])


@router.get('', response_model=list[CustomerOut])
def list_customers(db: DbSession, search: str | None = None):
    query = select(Customer).options(joinedload(Customer.orders).joinedload(Order.items))
    if search:
        query = query.where(or_(Customer.name.ilike(f'%{search}%'), Customer.phone.ilike(f'%{search}%'), Customer.email.ilike(f'%{search}%'), Customer.city.ilike(f'%{search}%')))
    return db.execute(query).unique().scalars().all()


@router.get('/{customer_id}', response_model=CustomerOut)
def get_customer(customer_id: str, db: DbSession):
    customer = db.execute(select(Customer).options(joinedload(Customer.orders).joinedload(Order.items)).where(Customer.id == customer_id)).unique().scalar_one_or_none()
    if not customer: raise HTTPException(404, 'Customer not found')
    return customer


@router.post('', response_model=CustomerOut, status_code=201)
def create_customer(payload: CustomerCreate, db: DbSession, _: CurrentUser):
    customer = Customer(id=f'cust-{uuid4().hex[:12]}', **payload.model_dump())
    db.add(customer); db.commit(); db.refresh(customer)
    return customer


@router.put('/{customer_id}', response_model=CustomerOut)
def update_customer(customer_id: str, payload: CustomerUpdate, db: DbSession, _: CurrentUser):
    customer = db.get(Customer, customer_id)
    if not customer: raise HTTPException(404, 'Customer not found')
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(customer, key, value)
    db.commit(); db.refresh(customer)
    return customer


@router.delete('/{customer_id}')
def delete_customer(customer_id: str, db: DbSession, _: CurrentUser):
    customer = db.get(Customer, customer_id)
    if not customer: raise HTTPException(404, 'Customer not found')
    db.delete(customer); db.commit()
    return {'success': True, 'id': customer_id}
