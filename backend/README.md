# Srinath FastAPI backend

## Run locally

1. Start PostgreSQL: `docker compose up -d db`
2. Create and activate a virtual environment.
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and set `JWT_SECRET`.
5. Run migrations: `alembic upgrade head`
6. Seed demo data: `python seed.py`
7. Start the API: `uvicorn app.main:app --reload --port 8000`

Swagger is available at `http://localhost:8000/docs`.
Demo users: `admin@alts.com` / `admin123`, and `staff@alts.com` / `staff123`.

## Frontend switch-over

In `src/services/api.js`, change the fallback base URL to `http://localhost:8000` (or set `VITE_API_BASE_URL=http://localhost:8000`). The existing bearer-token interceptor already sends `Authorization: Bearer <token>`.

Then replace each localStorage service implementation with the existing `api` calls already shown in its TODO comment:

- `sareeService`: `api.get('/sarees', { params: filters })`, `api.get('/sarees/:id')`, `api.post`, `api.put`, `api.delete`
- `customerService`: `api.get('/customers', { params: { search } })`, then `api.get/ post/put/delete` on `/customers/:id`
- `orderService`: `api.get('/orders', { params: filters })`, `api.get('/orders/:id')`, `api.post('/orders', orderPayload)`, and `api.patch('/orders/:id/status', { status })`
- `inventoryService`: use `/inventory/stock`, `/inventory/adjust`, and `/inventory/logs`
- `reportService`: use `/reports/summary`

The API returns camelCase aliases matching the React data shapes, while all money and inventory calculations remain server-side.
