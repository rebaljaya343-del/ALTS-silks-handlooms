from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: str, token_type: str = 'user') -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({'sub': user_id, 'type': token_type, 'exp': expires}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = payload.get('sub')
        token_type = payload.get('type')
        if not user_id:
            raise ValueError('Missing token subject')
        if not token_type:
            raise ValueError('Missing token type')
        return {'sub': user_id, 'type': token_type}
    except (JWTError, ValueError) as exc:
        raise ValueError('Invalid or expired token') from exc
