from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from ..auth import create_access_token, verify_password
from ..deps import CurrentUser, DbSession
from ..models import User
from ..schemas.schemas import LoginRequest, LoginResponse, UserOut

router = APIRouter(prefix='/auth', tags=['Auth'])


@router.post('/login', response_model=LoginResponse)
def login(payload: LoginRequest, db: DbSession):
    user = db.execute(select(User).where(User.email == payload.email.lower())).scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    return {'user': user, 'token': create_access_token(user.id, 'user')}


@router.get('/me', response_model=UserOut)
def me(user: CurrentUser):
    return user
