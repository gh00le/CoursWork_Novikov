import asyncio
from decimal import Decimal
from unittest.mock import AsyncMock

from app import cache
from app.schemas.product import ProductRead
from app.services import product_service
from app.services.product_service import ProductService


class InMemoryRedis:
    def __init__(self):
        self.values = {}
        self.ttls = {}

    async def hget(self, key, field):
        return self.values.get(key, {}).get(field)

    async def hset(self, key, mapping):
        self.values.setdefault(key, {}).update(mapping)

    async def expire(self, key, ttl):
        self.ttls[key] = ttl

    async def delete(self, key):
        self.values.pop(key, None)

    async def scan_iter(self, match):
        for key in list(self.values):
            if key.startswith(match.rstrip("*")):
                yield key

    async def ping(self):
        return True


def test_product_service_reuses_cached_product(monkeypatch):
    """Повторный запрос берёт данные из Redis, не вызывая репозиторий."""
    fake = InMemoryRedis()
    monkeypatch.setattr(cache, "redis_client", fake)
    monkeypatch.setattr(product_service, "get_cache", cache.get_cache)
    monkeypatch.setattr(product_service, "set_cache", cache.set_cache)

    product = ProductRead(
        id=5, name="Lamp", description="Test", price=Decimal("150.00"),
        stock=4, category_id=1,
    )
    repository = type("Repo", (), {})()
    repository.get_by_id = AsyncMock(return_value=product)
    service = ProductService(repository)

    first = asyncio.run(service.get_product(5))
    second = asyncio.run(service.get_product(5))

    assert first == second
    assert repository.get_by_id.await_count == 1
    assert fake.ttls["product:5"] > 0
    assert asyncio.run(cache.is_cache_available())


def test_product_cache_is_invalidated(monkeypatch):
    fake = InMemoryRedis()
    monkeypatch.setattr(cache, "redis_client", fake)
    monkeypatch.setattr(product_service, "delete_cache", cache.delete_cache)
    monkeypatch.setattr(product_service, "delete_cache_pattern", cache.delete_cache_pattern)

    async def check():
        await cache.set_cache("product:5", {"id": 5}, 60)
        await cache.set_cache("products:list:all", [{"id": 5}], 60)
        await ProductService.invalidate_product_cache(5)
        assert await cache.get_cache("product:5") is None
        assert await cache.get_cache("products:list:all") is None

    asyncio.run(check())
