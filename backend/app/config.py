import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./shop.db",
)

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://localhost:6379/0",
)

DEFAULT_PRODUCTS_LIMIT = 20  # Количество товаров в одном ответе каталога по умолчанию.
MAX_PRODUCTS_LIMIT = 100  # Максимальное количество товаров за один запрос.

CATALOG_CACHE_TTL_SECONDS = 60  # Каталог хранится в Redis 60 секунд.
PRODUCT_CACHE_TTL_SECONDS = 60  # Карточка товара хранится в Redis 60 секунд.
CATEGORIES_CACHE_TTL_SECONDS = 300  # Категории хранятся в Redis 5 минут.
CART_CACHE_TTL_SECONDS = 30  # Корзина хранится в Redis 30 секунд и сбрасывается при каждом изменении.

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
]
