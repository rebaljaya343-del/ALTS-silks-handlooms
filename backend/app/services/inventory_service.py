from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import InventoryLog, Saree


def adjust_stock(db: Session, *, saree_id: str, movement_type: str, quantity: int, reason: str, notes: str, adjusted_by: str) -> tuple[Saree, InventoryLog]:
    saree = db.execute(select(Saree).where(Saree.id == saree_id).with_for_update()).scalar_one_or_none()
    if not saree:
        raise HTTPException(status_code=404, detail='Saree not found')
    if movement_type == 'OUT' and saree.stock < quantity:
        raise HTTPException(status_code=400, detail=f'Insufficient stock for "{saree.name}". Available: {saree.stock}, Requested: {quantity}')
    saree.stock += quantity if movement_type == 'IN' else -quantity
    log = InventoryLog(id=f'log-{uuid4().hex[:12]}', saree_id=saree.id, saree_name=saree.name, sku=saree.sku, type=movement_type, quantity=quantity, reason=reason, adjusted_by=adjusted_by, notes=notes)
    db.add(log)
    return saree, log
