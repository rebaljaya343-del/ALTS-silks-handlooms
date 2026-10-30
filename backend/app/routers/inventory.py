from fastapi import APIRouter, HTTPException
from sqlalchemy import or_, select

from ..deps import CurrentUser, DbSession
from ..models import InventoryLog, Saree
from ..schemas.schemas import InventoryAdjustOut, InventoryAdjustRequest, InventoryLogOut, StockSummary
from ..services.inventory_service import adjust_stock
from .sarees import serialize

router = APIRouter(prefix='/inventory', tags=['Inventory'])


@router.get('/stock', response_model=list[StockSummary])
def stock(db: DbSession, search: str | None = None):
    query = select(Saree)
    if search: query = query.where(or_(Saree.name.ilike(f'%{search}%'), Saree.sku.ilike(f'%{search}%')))
    return [serialize(item) for item in db.execute(query).scalars().all()]


@router.post('/adjust', response_model=InventoryAdjustOut)
def adjust(payload: InventoryAdjustRequest, db: DbSession, _: CurrentUser):
    try:
        saree, log = adjust_stock(db, saree_id=payload.saree_id, movement_type=payload.type, quantity=payload.quantity, reason=payload.reason, notes=payload.notes, adjusted_by=payload.adjusted_by)
        db.commit(); db.refresh(log)
        return {'success': True, 'updatedStock': saree.stock, 'log': log}
    except Exception:
        db.rollback()
        raise


@router.get('/logs', response_model=list[InventoryLogOut])
def logs(db: DbSession, search: str | None = None, type: str | None = None, reason: str | None = None):
    query = select(InventoryLog)
    if search: query = query.where(or_(InventoryLog.saree_name.ilike(f'%{search}%'), InventoryLog.sku.ilike(f'%{search}%')))
    if type and type != 'All': query = query.where(InventoryLog.type == type)
    if reason and reason != 'All': query = query.where(InventoryLog.reason == reason)
    return db.execute(query.order_by(InventoryLog.timestamp.desc())).scalars().all()
