from uuid import uuid4

from fastapi import APIRouter, HTTPException
from sqlalchemy import and_, or_, select

from ..deps import CurrentUser, DbSession
from ..models import Saree
from ..schemas.schemas import SareeCreate, SareeOut, SareeUpdate

router = APIRouter(prefix='/sarees', tags=['Sarees'])


def serialize(saree: Saree) -> dict:
    data = {key: getattr(saree, key) for key in ['id', 'name', 'sku', 'category', 'fabric', 'occasion', 'price', 'cost_price', 'stock', 'low_stock_threshold', 'images', 'created_at', 'updated_at']}
    data['status'] = 'Out of Stock' if saree.stock == 0 else 'Low Stock' if saree.stock <= saree.low_stock_threshold else 'In Stock'
    return data


@router.get('', response_model=list[SareeOut])
def list_sarees(db: DbSession, search: str | None = None, category: str | None = None, fabric: str | None = None, occasion: str | None = None, status: str | None = None, minPrice: float | None = None, maxPrice: float | None = None):
    query = select(Saree)
    filters = []
    if search: filters.append(or_(Saree.name.ilike(f'%{search}%'), Saree.sku.ilike(f'%{search}%'), Saree.category.ilike(f'%{search}%'), Saree.fabric.ilike(f'%{search}%')))
    if category and category != 'All': filters.append(Saree.category.ilike(category))
    if fabric and fabric != 'All': filters.append(Saree.fabric.ilike(fabric))
    if occasion and occasion != 'All': filters.append(Saree.occasion.ilike(occasion))
    if minPrice is not None: filters.append(Saree.price >= minPrice)
    if maxPrice is not None: filters.append(Saree.price <= maxPrice)
    sarees = db.execute(query.where(and_(*filters))).scalars().all()
    if status and status != 'All': sarees = [s for s in sarees if serialize(s)['status'].lower() == status.lower()]
    return [serialize(s) for s in sarees]


@router.get('/{saree_id}', response_model=SareeOut)
def get_saree(saree_id: str, db: DbSession):
    saree = db.get(Saree, saree_id)
    if not saree: raise HTTPException(404, 'Saree not found')
    return serialize(saree)


@router.post('', response_model=SareeOut, status_code=201)
def create_saree(payload: SareeCreate, db: DbSession, _: CurrentUser):
    saree = Saree(id=f'sar-{uuid4().hex[:12]}', **payload.model_dump())
    db.add(saree); db.commit(); db.refresh(saree)
    return serialize(saree)


@router.put('/{saree_id}', response_model=SareeOut)
def update_saree(saree_id: str, payload: SareeUpdate, db: DbSession, _: CurrentUser):
    saree = db.get(Saree, saree_id)
    if not saree: raise HTTPException(404, 'Saree not found')
    for key, value in payload.model_dump(exclude_unset=True).items(): setattr(saree, key, value)
    db.commit(); db.refresh(saree)
    return serialize(saree)


@router.delete('/{saree_id}')
def delete_saree(saree_id: str, db: DbSession, _: CurrentUser):
    saree = db.get(Saree, saree_id)
    if not saree: raise HTTPException(404, 'Saree not found')
    db.delete(saree); db.commit()
    return {'success': True, 'id': saree_id}
