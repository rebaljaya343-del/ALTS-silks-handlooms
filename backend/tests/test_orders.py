from decimal import Decimal
from fastapi.testclient import TestClient


def test_online_order_starts_as_new(client: TestClient, customer_headers: dict, staff_headers: dict):
    # Customer places order online
    payload = {
        'items': [{'sareeId': 'sar-1', 'quantity': 2, 'price': '10000.00'}],
        'discount': 0,
        'paymentMethod': 'UPI',
        'notes': 'Deliver before Friday',
    }
    response = client.post('/shop/orders', json=payload, headers=customer_headers)
    assert response.status_code == 201, response.text
    data = response.json()

    assert data['status'] == 'New'
    assert data['source'] == 'Online'
    assert data['customerName'] == 'Priya Menon'
    assert data['customerPhone'] == '9876543210'
    assert len(data['items']) == 1
    assert data['items'][0]['sareeId'] == 'sar-1'
    assert data['items'][0]['quantity'] == 2

    # Verify inventory was reduced from 10 to 8
    saree_res = client.get('/sarees/sar-1', headers=staff_headers)
    assert saree_res.status_code == 200
    assert saree_res.json()['stock'] == 8

    # Verify inventory log was recorded with adjusted_by = customer's name and reason = 'Online Order'
    logs_res = client.get('/inventory/logs', headers=staff_headers)
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) >= 1
    latest_log = logs[0]
    assert latest_log['reason'] == 'Online Order'
    assert latest_log['adjustedBy'] == 'Priya Menon'
    assert latest_log['type'] == 'OUT'
    assert latest_log['quantity'] == 2


def test_invalid_status_transitions_return_400(client: TestClient, customer_headers: dict, staff_headers: dict):
    # Place an online order (starts as New)
    payload = {
        'items': [{'sareeId': 'sar-1', 'quantity': 1, 'price': '10000.00'}],
        'discount': 0,
        'paymentMethod': 'COD',
        'notes': 'Test transitions',
    }
    order = client.post('/shop/orders', json=payload, headers=customer_headers).json()
    order_id = order['id']
    assert order['status'] == 'New'

    # Trying New -> Delivered directly is invalid
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Delivered'}, headers=staff_headers)
    assert res.status_code == 400
    assert 'Invalid transition' in res.json()['detail']

    # Trying New -> Packed directly is invalid
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Packed'}, headers=staff_headers)
    assert res.status_code == 400

    # Trying New -> Shipped directly is invalid
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Shipped'}, headers=staff_headers)
    assert res.status_code == 400

    # Trying New -> Completed directly is invalid
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Completed'}, headers=staff_headers)
    assert res.status_code == 400

    # Valid: New -> Accepted
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Accepted'}, headers=staff_headers)
    assert res.status_code == 200
    assert res.json()['status'] == 'Accepted'

    # Accepted -> Delivered directly is invalid
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Delivered'}, headers=staff_headers)
    assert res.status_code == 400

    # Accepted -> New backwards is invalid
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'New'}, headers=staff_headers)
    assert res.status_code == 400

    # Valid: Accepted -> Packed
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Packed'}, headers=staff_headers)
    assert res.status_code == 200
    assert res.json()['status'] == 'Packed'

    # Valid: Packed -> Shipped
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Shipped'}, headers=staff_headers)
    assert res.status_code == 200
    assert res.json()['status'] == 'Shipped'

    # Valid: Shipped -> Delivered
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Delivered'}, headers=staff_headers)
    assert res.status_code == 200
    assert res.json()['status'] == 'Delivered'

    # Terminal: Delivered -> Cancelled is invalid
    res = client.patch(f'/orders/{order_id}/status', json={'status': 'Cancelled'}, headers=staff_headers)
    assert res.status_code == 400


def test_reject_requires_reason_and_restocks_exactly_once(client: TestClient, customer_headers: dict, staff_headers: dict):
    # Customer starts with 0 orders and 0 spend
    cust_res = client.get('/customer-auth/me', headers=customer_headers).json()
    cust_id = cust_res['id']

    # Place order for 3 sarees (Stock: 10 -> 7)
    payload = {
        'items': [{'sareeId': 'sar-1', 'quantity': 3, 'price': '10000.00'}],
        'discount': 0,
        'paymentMethod': 'UPI',
        'notes': 'Reject test',
    }
    order_res = client.post('/shop/orders', json=payload, headers=customer_headers)
    assert order_res.status_code == 201
    order = order_res.json()
    order_id = order['id']

    # Check stock decreased to 7
    saree_res = client.get('/sarees/sar-1', headers=staff_headers).json()
    assert saree_res['stock'] == 7

    # Check customer total_orders and total_spend increased
    customer_info = client.get(f'/customers/{cust_id}', headers=staff_headers).json()
    assert customer_info['totalOrders'] == 1
    assert Decimal(str(customer_info['totalSpend'])) == Decimal(str(order['totalAmount']))

    # Reject without rejection reason should fail with 400
    fail_res = client.patch(f'/orders/{order_id}/status', json={'status': 'Rejected'}, headers=staff_headers)
    assert fail_res.status_code == 400
    assert 'Rejection reason is required' in fail_res.json()['detail']

    # Stock should still be 7
    assert client.get('/sarees/sar-1', headers=staff_headers).json()['stock'] == 7

    # Reject with valid rejection reason
    rej_res = client.patch(
        f'/orders/{order_id}/status',
        json={'status': 'Rejected', 'rejectionReason': 'Item damaged during handling inspection'},
        headers=staff_headers,
    )
    assert rej_res.status_code == 200
    rej_order = rej_res.json()
    assert rej_order['status'] == 'Rejected'
    assert rej_order['rejectionReason'] == 'Item damaged during handling inspection'
    assert rej_order['handledBy'] == 'Kavitha Ramaswamy'
    assert rej_order['handledAt'] is not None

    # Stock should be fully restored back to 10
    restocked_saree = client.get('/sarees/sar-1', headers=staff_headers).json()
    assert restocked_saree['stock'] == 10

    # Customer spend & order count should be reversed back to 0
    reversed_customer = client.get(f'/customers/{cust_id}', headers=staff_headers).json()
    assert reversed_customer['totalOrders'] == 0
    assert Decimal(str(reversed_customer['totalSpend'])) == Decimal('0')

    # Guard against double restock: attempting any transition from Rejected returns 400
    double_attempt = client.patch(
        f'/orders/{order_id}/status',
        json={'status': 'Rejected', 'rejectionReason': 'Try again'},
        headers=staff_headers,
    )
    assert double_attempt.status_code == 400
    # Stock must remain 10 (not 13)
    assert client.get('/sarees/sar-1', headers=staff_headers).json()['stock'] == 10


def test_staff_endpoints_return_401_without_token(client: TestClient):
    assert client.get('/orders').status_code == 401
    assert client.get('/orders/summary/new-count').status_code == 401
    assert client.get('/orders/ord-123').status_code == 401
    assert client.post('/orders', json={}).status_code == 401
    assert client.patch('/orders/ord-123/status', json={'status': 'Accepted'}).status_code == 401


def test_get_orders_filters_and_sorting(client: TestClient, customer_headers: dict, staff_headers: dict):
    # Create 1 online order and 1 store order
    client.post(
        '/shop/orders',
        json={'items': [{'sareeId': 'sar-1', 'quantity': 1, 'price': '10000.00'}], 'paymentMethod': 'UPI'},
        headers=customer_headers,
    )
    client.post(
        '/orders',
        json={
            'customerName': 'Store Walkin',
            'customerPhone': '9999988888',
            'items': [{'sareeId': 'sar-1', 'quantity': 1, 'price': '10000.00'}],
            'paymentMethod': 'Cash',
        },
        headers=staff_headers,
    )

    # Filter by source=Online
    online_orders = client.get('/orders?source=Online', headers=staff_headers).json()
    assert len(online_orders) == 1
    assert online_orders[0]['source'] == 'Online'
    assert online_orders[0]['status'] == 'New'

    # Filter by source=Store
    store_orders = client.get('/orders?source=Store', headers=staff_headers).json()
    assert len(store_orders) == 1
    assert store_orders[0]['source'] == 'Store'
    assert store_orders[0]['status'] == 'Completed'

    # Summary new-count
    summary = client.get('/orders/summary/new-count', headers=staff_headers).json()
    assert summary['newCount'] == 1
    assert len(summary['latest']) == 1
    assert summary['latest'][0]['customerName'] == 'Priya Menon'
    assert 'orderNumber' in summary['latest'][0]
    assert 'totalAmount' in summary['latest'][0]
    assert 'date' in summary['latest'][0]


def test_customer_live_status_visibility(client: TestClient, customer_headers: dict, staff_headers: dict):
    # Customer places order
    order = client.post(
        '/shop/orders',
        json={'items': [{'sareeId': 'sar-1', 'quantity': 1, 'price': '10000.00'}], 'paymentMethod': 'UPI'},
        headers=customer_headers,
    ).json()
    order_id = order['id']

    # Staff accepts order
    client.patch(f'/orders/{order_id}/status', json={'status': 'Accepted'}, headers=staff_headers)

    # Customer fetches their orders
    my_orders = client.get('/customer-auth/orders', headers=customer_headers).json()
    assert len(my_orders) >= 1
    target = next(o for o in my_orders if o['id'] == order_id)
    assert target['status'] == 'Accepted'
    assert target['handledBy'] == 'Kavitha Ramaswamy'
    assert target['handledAt'] is not None
    assert target['source'] == 'Online'
