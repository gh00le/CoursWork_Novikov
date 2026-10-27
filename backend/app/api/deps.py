from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.repositories.category_repository import CategoryRepository
from app.repositories.product_repository import ProductRepository
from app.services.cart_service import CartService
from app.services.category_service import CategoryService
from app.services.order_service import OrderService
from app.services.product_service import ProductService

DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


def get_category_service(db: DatabaseSession) -> CategoryService:
    return CategoryService(CategoryRepository(db))


def get_product_service(db: DatabaseSession) -> ProductService:
    return ProductService(ProductRepository(db))


def get_cart_service(db: DatabaseSession) -> CartService:
    return CartService(db)


def get_order_service(db: DatabaseSession) -> OrderService:
    return OrderService(db)
