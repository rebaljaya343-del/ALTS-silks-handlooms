from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = 'users'
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default='staff')
    role_title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Saree(Base):
    __tablename__ = 'sarees'
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(120))
    fabric: Mapped[str] = mapped_column(String(120))
    occasion: Mapped[str] = mapped_column(String(120))
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    cost_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=5)
    images: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    order_items: Mapped[list['OrderItem']] = relationship(back_populates='saree')
    inventory_logs: Mapped[list['InventoryLog']] = relationship(back_populates='saree')


class Customer(Base):
    __tablename__ = 'customers'
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(40), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, default='')
    password_hash: Mapped[str] = mapped_column(String(255), default='')
    city: Mapped[str] = mapped_column(String(120), default='')
    tier: Mapped[str] = mapped_column(String(40), default='Regular')
    total_orders: Mapped[int] = mapped_column(Integer, default=0)
    total_spend: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0'))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    orders: Mapped[list['Order']] = relationship(back_populates='customer')


class Order(Base):
    __tablename__ = 'orders'
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    order_number: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    invoice_number: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    customer_id: Mapped[str | None] = mapped_column(ForeignKey('customers.id'), nullable=True)
    customer_name: Mapped[str] = mapped_column(String(160))
    customer_phone: Mapped[str] = mapped_column(String(40))
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    discount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal('0'))
    tax: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    payment_method: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(30), default='Completed')
    source: Mapped[str] = mapped_column(String(20), default='Store')
    handled_by: Mapped[str | None] = mapped_column(String(160), nullable=True)
    handled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default='')
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    customer: Mapped[Customer | None] = relationship(back_populates='orders')
    items: Mapped[list['OrderItem']] = relationship(back_populates='order', cascade='all, delete-orphan')


class OrderItem(Base):
    __tablename__ = 'order_items'
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    order_id: Mapped[str] = mapped_column(ForeignKey('orders.id'), index=True)
    saree_id: Mapped[str] = mapped_column(ForeignKey('sarees.id'), index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    order: Mapped[Order] = relationship(back_populates='items')
    saree: Mapped[Saree] = relationship(back_populates='order_items')


class InventoryLog(Base):
    __tablename__ = 'inventory_logs'
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    saree_id: Mapped[str] = mapped_column(ForeignKey('sarees.id'), index=True)
    saree_name: Mapped[str] = mapped_column(String(255))
    sku: Mapped[str] = mapped_column(String(80))
    type: Mapped[str] = mapped_column(String(5))
    quantity: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(255))
    adjusted_by: Mapped[str] = mapped_column(String(160))
    notes: Mapped[str] = mapped_column(Text, default='')
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    saree: Mapped[Saree] = relationship(back_populates='inventory_logs')
