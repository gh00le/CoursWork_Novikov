import asyncio
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.database import Base, get_db
from app.main import app
from app.models import Category, Product


@pytest.fixture
def test_database(tmp_path, monkeypatch):
    db_path = tmp_path / "coursework-tests.sqlite3"
    sync_engine = create_engine(
        f"sqlite:///{db_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=sync_engine)
    testing_session = sessionmaker(bind=sync_engine, autoflush=False, autocommit=False)

    # отдельные соединения не привязаны к event loop, который создаёт TestClient.
    async_engine = create_async_engine(
        f"sqlite+aiosqlite:///{db_path.as_posix()}",
        poolclass=NullPool,
    )
    testing_async_session = async_sessionmaker(
        bind=async_engine,
        expire_on_commit=False,
        autoflush=False,
    )

    async def override_get_db():
        async with testing_async_session() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db

    # тесты проверяют бизнес-логику отдельно от доступности сервиса redis.
    async def no_cache(_key):
        return None

    async def no_write(*_args, **_kwargs):
        return None

    async def no_delete(*_args, **_kwargs):
        return None

    monkeypatch.setattr("app.services.category_service.get_cache", no_cache)
    monkeypatch.setattr("app.services.category_service.set_cache", no_write)
    monkeypatch.setattr("app.services.product_service.get_cache", no_cache)
    monkeypatch.setattr("app.services.product_service.set_cache", no_write)
    monkeypatch.setattr("app.services.product_service.delete_cache", no_delete)
    monkeypatch.setattr("app.services.product_service.delete_cache_pattern", no_delete)
    monkeypatch.setattr("app.services.cart_service.get_cache", no_cache)
    monkeypatch.setattr("app.services.cart_service.set_cache", no_write)
    monkeypatch.setattr("app.services.cart_service.delete_cache", no_delete)
    monkeypatch.setattr("app.services.order_service.delete_cache", no_delete)

    yield testing_session

    app.dependency_overrides.clear()
    asyncio.run(async_engine.dispose())
    Base.metadata.drop_all(bind=sync_engine)
    sync_engine.dispose()


@pytest.fixture
def client(test_database):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def create_product(test_database):
    def _create_product(*, name="Test product", price="100.00", stock=5):
        db = test_database()
        try:
            category = (
                db.query(Category).filter(Category.name == "Test category").first()
            )
            if category is None:
                category = Category(name="Test category")
                db.add(category)
                db.flush()
            product = Product(
                name=name,
                description="A product created for automated tests.",
                price=Decimal(price),
                stock=stock,
                image_url="/images/products/placeholder.svg",
                category_id=category.id,
            )
            db.add(product)
            db.commit()
            db.refresh(product)
            return product.id
        finally:
            db.close()

    return _create_product
