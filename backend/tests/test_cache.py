import asyncio
import json

from app import cache


class FakeRedis:
    def __init__(self):
        self.hashes = {}
        self.expirations = {}

    async def hget(self, key, field):
        return self.hashes.get(key, {}).get(field)

    async def hset(self, key, mapping):
        self.hashes.setdefault(key, {}).update(mapping)
        return 1

    async def expire(self, key, ttl):
        self.expirations[key] = ttl
        return True

    async def delete(self, key):
        self.hashes.pop(key, None)
        self.expirations.pop(key, None)
        return 1

    async def scan_iter(self, match):
        prefix = match.rstrip("*")
        for key in list(self.hashes):
            if key.startswith(prefix):
                yield key


def test_cache_uses_hash_payload_and_expiration(monkeypatch):
    fake_redis = FakeRedis()
    monkeypatch.setattr(cache, "redis_client", fake_redis)

    asyncio.run(cache.set_cache("product:7", {"id": 7, "name": "Test"}, 60))

    assert fake_redis.hashes["product:7"]["payload"] == json.dumps(
        {"id": 7, "name": "Test"}, ensure_ascii=False
    )
    assert fake_redis.expirations["product:7"] == 60
    assert asyncio.run(cache.get_cache("product:7")) == {"id": 7, "name": "Test"}


def test_cache_pattern_invalidation(monkeypatch):
    fake_redis = FakeRedis()
    monkeypatch.setattr(cache, "redis_client", fake_redis)
    asyncio.run(cache.set_cache("products:list:a", {"items": []}, 60))
    asyncio.run(cache.set_cache("products:list:b", {"items": []}, 60))
    asyncio.run(cache.set_cache("product:3", {"id": 3}, 60))

    asyncio.run(cache.delete_cache_pattern("products:list:*"))

    assert asyncio.run(cache.get_cache("products:list:a")) is None
    assert asyncio.run(cache.get_cache("products:list:b")) is None
    assert asyncio.run(cache.get_cache("product:3")) == {"id": 3}
