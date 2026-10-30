import os
import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import create_access_token, hash_password
from app.database import Base, get_db
from app.main import app
from app.models import Customer, Saree, User

TEST_DATABASE_URL = 'sqlite:///:memory:'

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={'check_same_thread': False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Seed Admin User
    admin_user = User(
        id='usr-admin-1',
        name='Srinath',
        email='admin@alts.com',
        password_hash=hash_password('admin123'),
        role='admin',
        role_title='Store Director',
    )
    # Seed Staff User
    staff_user = User(
        id='usr-staff-2',
        name='Kavitha Ramaswamy',
        email='staff@alts.com',
        password_hash=hash_password('staff123'),
        role='staff',
        role_title='Sales Staff',
    )
    # Seed Customer
    customer = Customer(
        id='cust-1',
        name='Priya Menon',
        phone='9876543210',
        email='priya@example.com',
        password_hash=hash_password('password123'),
        city='Chennai',
        total_orders=0,
        total_spend=Decimal('0'),
    )
    # Seed Saree
    saree = Saree(
        id='sar-1',
        name='Kanjivaram Silk Saree',
        sku='KAN-101',
        category='Kanjivaram',
        fabric='Silk',
        occasion='Bridal',
        price=Decimal('10000.00'),
        cost_price=Decimal('6000.00'),
        stock=10,
        low_stock_threshold=2,
        images=['https://example.com/saree.jpg'],
    )

    db.add_all([admin_user, staff_user, customer, saree])
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_headers():
    token = create_access_token('usr-admin-1', 'user')
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def staff_headers():
    token = create_access_token('usr-staff-2', 'user')
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def customer_headers():
    token = create_access_token('cust-1', 'customer')
    return {'Authorization': f'Bearer {token}'}
