from fastapi import APIRouter
from app.api.v1 import cart, categories, health, orders, products

v1_router = APIRouter()
v1_router.include_router(health.router)
v1_router.include_router(categories.router)
v1_router.include_router(products.router)
v1_router.include_router(cart.router)
v1_router.include_router(orders.router)
