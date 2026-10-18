from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Category, Product

test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)

Base.metadata.create_all(bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def prepare_product():
    db = TestingSessionLocal()

    try:
        db.query(Product).delete()
        db.query(Category).delete()

        category = Category(name="Тестовая категория")
        db.add(category)
        db.flush()

        product = Product(
            name="Тестовый товар",
            description="Товар для автоматического теста.",
            price=Decimal("100.00"),
            stock=5,
            image_url=None,
            category_id=category.id,
        )

        db.add(product)
        db.commit()
        db.refresh(product)

        return product.id
    finally:
        db.close()


def test_get_products():
    prepare_product()

    response = client.get("/api/products")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Тестовый товар"


def test_get_product_by_id():
    product_id = prepare_product()

    response = client.get(f"/api/products/{product_id}")

    assert response.status_code == 200
    assert response.json()["id"] == product_id
