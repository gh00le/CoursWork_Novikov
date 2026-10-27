import os


def _csv_env(name: str, default: str) -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./shop.db")
# индекс 0 выбран как стандартная отдельная база
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# значение 20 позволяет показать каталог без чрезмерного ответа по умолчанию
DEFAULT_PRODUCTS_LIMIT = 20
# лимит в 100 защищает api от случайной загрузки слишком большой выборки за один запрос
MAX_PRODUCTS_LIMIT = 100

# значение 60 секунд - компромисс между свежестью каталога и числом sql-запросов
CATALOG_CACHE_TTL_SECONDS = 60
# кэш карточки на 60 секунд ускоряет повторные запросы и ограничивает устаревание данных
PRODUCT_CACHE_TTL_SECONDS = 60
# категории меняются реже каталога, поэтому кэш можно хранить 300 секунд (5 минут)
CATEGORIES_CACHE_TTL_SECONDS = 300
# кэш корзины на 30 секунд помогает быстрее отражать изменения пользователя
CART_CACHE_TTL_SECONDS = 30

CORS_ORIGINS = _csv_env(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:4173,http://localhost:3000",
)
