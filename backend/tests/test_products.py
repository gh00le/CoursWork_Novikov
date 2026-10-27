def test_list_products_and_filter(client, create_product):
    create_product(name="Test laptop")
    create_product(name="Desk lamp", price="50.00")

    response = client.get("/api/v1/products", params={"search": "laptop"})

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Test laptop"


def test_get_product_by_id(client, create_product):
    product_id = create_product()

    response = client.get(f"/api/v1/products/{product_id}")

    assert response.status_code == 200
    assert response.json()["id"] == product_id
    assert response.json()["price"] == "100.00"


def test_missing_product_returns_404(client):
    response = client.get("/api/v1/products/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_legacy_api_alias_still_works(client, create_product):
    create_product()

    response = client.get("/api/products")

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_list_categories(client, create_product):
    create_product()

    response = client.get("/api/v1/categories")

    assert response.status_code == 200
    assert response.json() == [{"id": 1, "name": "Test category"}]
