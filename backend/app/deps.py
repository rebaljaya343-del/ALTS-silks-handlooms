from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .auth import decode_access_token
from .database import get_db
from .models import Customer, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')
customer_oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/customer-auth/login')


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]) -> User:
    try:
        claims = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc), headers={'WWW-Authenticate': 'Bearer'}) from exc
    if claims.get('type') != 'user':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token type', headers={'WWW-Authenticate': 'Bearer'})
    user = db.get(User, claims.get('sub'))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found', headers={'WWW-Authenticate': 'Bearer'})
    return user


def get_current_customer(token: Annotated[str, Depends(customer_oauth2_scheme)], db: Annotated[Session, Depends(get_db)]) -> Customer:
    try:
        claims = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc), headers={'WWW-Authenticate': 'Bearer'}) from exc
    if claims.get('type') != 'customer':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token type', headers={'WWW-Authenticate': 'Bearer'})
    customer = db.get(Customer, claims.get('sub'))
    if not customer:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Customer not found', headers={'WWW-Authenticate': 'Bearer'})
    return customer


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentCustomer = Annotated[Customer, Depends(get_current_customer)]
DbSession = Annotated[Session, Depends(get_db)]
