def create_cart(client):
    response = client.post("/api/v1/cart")
    assert response.status_code == 201
    return response.json()["id"]


def test_cart_add_update_and_remove(client, create_product):
    product_id = create_product(price="100.00", stock=5)
    cart_id = create_cart(client)

    added = client.post(
        f"/api/v1/cart/{cart_id}/items",
        json={"product_id": product_id, "quantity": 2},
    )
    assert added.status_code == 201
    assert added.json()["total"] == "200.00"
    item_id = added.json()["items"][0]["id"]

    updated = client.patch(
        f"/api/v1/cart/{cart_id}/items/{item_id}",
        json={"quantity": 3},
    )
    assert updated.status_code == 200
    assert updated.json()["total"] == "300.00"

    removed = client.delete(f"/api/v1/cart/{cart_id}/items/{item_id}")
    assert removed.status_code == 204

    loaded = client.get(f"/api/v1/cart/{cart_id}")
    assert loaded.status_code == 200
    assert loaded.json()["items"] == []
    assert loaded.json()["total"] == "0.00"


def test_cart_rejects_quantity_above_stock(client, create_product):
    product_id = create_product(stock=1)
    cart_id = create_cart(client)

    response = client.post(
        f"/api/v1/cart/{cart_id}/items",
        json={"product_id": product_id, "quantity": 2},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Not enough products in stock"


def test_checkout_creates_order_and_decrements_stock(
    client,
    create_product,
    test_database,
):
    product_id = create_product(price="25.50", stock=5)
    cart_id = create_cart(client)
    added = client.post(
        f"/api/v1/cart/{cart_id}/items",
        json={"product_id": product_id, "quantity": 2},
    )
    assert added.status_code == 201

    response = client.post("/api/v1/orders", json={"cart_id": cart_id})

    assert response.status_code == 201
    order = response.json()
    assert order["total_amount"] == "51.00"
    assert order["status"] == "created"
    assert len(order["items"]) == 1
    assert order["items"][0]["quantity"] == 2

    cart = client.get(f"/api/v1/cart/{cart_id}").json()
    assert cart["items"] == []

    db = test_database()
    try:
        from app.models import Product

        product = db.get(Product, product_id)
        assert product.stock == 3
    finally:
        db.close()

    loaded_order = client.get(f"/api/v1/orders/{order['id']}")
    assert loaded_order.status_code == 200
    assert loaded_order.json()["id"] == order["id"]


def test_checkout_rejects_empty_cart(client):
    cart_id = create_cart(client)

    response = client.post("/api/v1/orders", json={"cart_id": cart_id})

    assert response.status_code == 400
    assert response.json()["detail"] == "Cart is empty"


def test_missing_cart_returns_404(client):
    response = client.get("/api/v1/cart/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Cart not found"
