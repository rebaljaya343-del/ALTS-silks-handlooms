from fastapi import APIRouter
from sqlalchemy import func, select

from ..deps import CurrentUser, DbSession
from ..models import InventoryLog, Order, OrderItem, Saree
from ..schemas.schemas import ReportSummary

router = APIRouter(prefix='/reports', tags=['Reports'])


@router.get('/summary', response_model=ReportSummary)
def summary(db: DbSession, _: CurrentUser):
    revenue = db.execute(select(func.date(Order.date), func.sum(Order.total_amount)).where(Order.status == 'Completed').group_by(func.date(Order.date)).order_by(func.date(Order.date))).all()
    top = db.execute(select(Saree.name, func.sum(OrderItem.quantity).label('quantity'), func.sum(OrderItem.price * OrderItem.quantity).label('revenue')).join(OrderItem, OrderItem.saree_id == Saree.id).join(Order, Order.id == OrderItem.order_id).where(Order.status == 'Completed').group_by(Saree.id, Saree.name).order_by(func.sum(OrderItem.quantity).desc()).limit(10)).all()
    low_stock = db.execute(select(Saree).where(Saree.stock <= Saree.low_stock_threshold).order_by(Saree.stock)).scalars().all()
    return {'revenueOverTime': [{'date': str(day), 'revenue': total} for day, total in revenue], 'topSellingSarees': [{'name': name, 'quantity': quantity, 'revenue': amount} for name, quantity, amount in top], 'lowStockAlerts': low_stock}
