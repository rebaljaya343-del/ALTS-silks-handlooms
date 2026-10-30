from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import auth, customer_auth, customers, inventory, orders, reports, sarees

app = FastAPI(title=settings.app_name, version='1.0.0')
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r'https?://(localhost|127\.0\.0\.1)(:\d+)?',
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
app.include_router(auth.router)
app.include_router(customer_auth.router)
app.include_router(customer_auth.shop_router)
app.include_router(sarees.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(inventory.router)
app.include_router(reports.router)


@app.get('/health')
def health():
    return {'status': 'ok'}
