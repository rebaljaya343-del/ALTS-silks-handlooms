from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, serialize_by_alias=True)


class UserOut(APIModel):
    id: str
    name: str
    email: str
    role: Literal['admin', 'staff']
    role_title: Optional[str] = Field(default=None, alias='roleTitle')
    avatar: Optional[str] = None
    created_at: datetime = Field(alias='createdAt')


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    user: UserOut
    token: str


class SareeBase(BaseModel):
    name: str
    sku: str
    category: str
    fabric: str
    occasion: str
    price: Decimal = Field(ge=0)
    cost_price: Decimal = Field(default=Decimal('0'), ge=0, alias='costPrice')
    stock: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0, alias='lowStockThreshold')
    images: list[str] = Field(default_factory=list)


class SareeCreate(SareeBase):
    pass


class SareeUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    name: str | None = None
    sku: str | None = None
    category: str | None = None
    fabric: str | None = None
    occasion: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    cost_price: Decimal | None = Field(default=None, ge=0, alias='costPrice')
    stock: int | None = Field(default=None, ge=0)
    low_stock_threshold: int | None = Field(default=None, ge=0, alias='lowStockThreshold')
    images: list[str] | None = None


class SareeOut(APIModel):
    id: str
    name: str
    sku: str
    category: str
    fabric: str
    occasion: str
    price: Decimal
    cost_price: Decimal = Field(alias='costPrice')
    stock: int
    low_stock_threshold: int = Field(alias='lowStockThreshold')
    status: str
    images: list[str]
    created_at: datetime = Field(alias='createdAt')
    updated_at: datetime | None = Field(default=None, alias='updatedAt')


class CustomerRegister(BaseModel):
    name: str
    phone: str
    email: str
    password: str = Field(min_length=6)


class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: str = ''
    city: str = ''
    tier: str = 'Regular'


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    city: str | None = None
    tier: str | None = None
    total_orders: int | None = Field(default=None, alias='totalOrders')
    total_spend: Decimal | None = Field(default=None, alias='totalSpend')


class CustomerOut(APIModel):
    id: str
    name: str
    phone: str
    email: str
    city: str
    tier: str
    total_orders: int = Field(alias='totalOrders')
    total_spend: Decimal = Field(alias='totalSpend')
    created_at: datetime = Field(alias='createdAt')
    updated_at: datetime | None = Field(default=None, alias='updatedAt')
    orders: list['OrderOut'] = Field(default_factory=list)


class CustomerAuthOut(APIModel):
    id: str
    name: str
    email: str
    phone: str


class CustomerLoginResponse(BaseModel):
    customer: CustomerAuthOut
    token: str


class OrderItemRequest(BaseModel):
    saree_id: str = Field(alias='sareeId')
    quantity: int = Field(gt=0)
    price: Decimal = Field(ge=0)


class OrderCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    customer_id: Optional[str] = Field(default=None, alias='customerId')
    customer_name: Optional[str] = Field(default=None, alias='customerName')
    customer_phone: Optional[str] = Field(default=None, alias='customerPhone')
    items: list[OrderItemRequest] = Field(min_length=1)
    discount: Decimal = Field(default=Decimal('0'), ge=0)
    payment_method: Literal['Cash', 'COD', 'UPI', 'Card'] = Field(default='UPI', alias='paymentMethod')
    notes: str = ''
    staff_name: str = Field(default='Store Cashier', alias='staffName')


class OrderItemOut(APIModel):
    id: str
    saree_id: str = Field(alias='sareeId')
    quantity: int
    price: Decimal
    name: Optional[str] = None
    image: Optional[str] = None


OrderStatus = Literal['New', 'Accepted', 'Packed', 'Shipped', 'Delivered', 'Rejected', 'Cancelled', 'Pending', 'Completed']
OrderSource = Literal['Online', 'Store']


class OrderOut(APIModel):
    id: str
    order_number: str = Field(alias='orderNumber')
    invoice_number: str = Field(alias='invoiceNumber')
    customer_id: Optional[str] = Field(default=None, alias='customerId')
    customer_name: str = Field(alias='customerName')
    customer_phone: str = Field(alias='customerPhone')
    items: list[OrderItemOut]
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    total_amount: Decimal = Field(alias='totalAmount')
    payment_method: str = Field(alias='paymentMethod')
    status: OrderStatus
    source: str = 'Store'
    handled_by: Optional[str] = Field(default=None, alias='handledBy')
    handled_at: Optional[datetime] = Field(default=None, alias='handledAt')
    rejection_reason: Optional[str] = Field(default=None, alias='rejectionReason')
    date: datetime
    notes: str


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    rejection_reason: Optional[str] = Field(default=None, alias='rejectionReason')
    model_config = ConfigDict(populate_by_name=True)


class NewOrderSummaryItem(APIModel):
    order_number: str = Field(alias='orderNumber')
    customer_name: str = Field(alias='customerName')
    total_amount: Decimal = Field(alias='totalAmount')
    date: datetime


class NewOrdersSummaryOut(APIModel):
    new_count: int = Field(alias='newCount')
    latest: list[NewOrderSummaryItem]


class InventoryAdjustRequest(BaseModel):
    saree_id: str = Field(alias='sareeId')
    type: Literal['IN', 'OUT']
    quantity: int = Field(gt=0)
    reason: str
    notes: str = ''
    adjusted_by: str = Field(alias='adjustedBy')


class InventoryLogOut(APIModel):
    id: str
    saree_id: str = Field(alias='sareeId')
    saree_name: str = Field(alias='sareeName')
    sku: str
    type: str
    quantity: int
    reason: str
    adjusted_by: str = Field(alias='adjustedBy')
    notes: str
    timestamp: datetime


class InventoryAdjustOut(BaseModel):
    success: bool
    updated_stock: int = Field(alias='updatedStock')
    log: InventoryLogOut
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class StockSummary(SareeOut):
    pass


class ReportSummary(BaseModel):
    revenue_over_time: list[dict] = Field(alias='revenueOverTime')
    top_selling_sarees: list[dict] = Field(alias='topSellingSarees')
    low_stock_alerts: list[SareeOut] = Field(alias='lowStockAlerts')
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


CustomerOut.model_rebuild()
