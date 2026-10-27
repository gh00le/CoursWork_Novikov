import json
from typing import Any
from app.core.config import REDIS_URL

try:
    from redis.asyncio import Redis
    from redis.exceptions import RedisError
except ImportError:

    class RedisError(Exception):
        pass

    class Redis:
        @classmethod
        def from_url(cls, *_args, **_kwargs):
            class UnavailableRedis:
                async def hget(self, *_args, **_kwargs):
                    raise RedisError("redis package is not installed")

                async def hset(self, *_args, **_kwargs):
                    raise RedisError("redis package is not installed")

                async def expire(self, *_args, **_kwargs):
                    raise RedisError("redis package is not installed")

                async def delete(self, *_args, **_kwargs):
                    raise RedisError("redis package is not installed")

                async def scan_iter(self, *_args, **_kwargs):
                    raise RedisError("redis package is not installed")
                    yield None

            return UnavailableRedis()


redis_client = Redis.from_url(
    REDIS_URL,
    decode_responses=True,
    # тайм-аут в 0.25 секунды позволяет быстро перейти к базе если redis недоступен
    socket_connect_timeout=0.25,
    # такой же короткий тайм-аут ограничивает ожидание ответа кэша
    socket_timeout=0.25,
)


async def get_cache(key: str) -> Any | None:
    try:
        value = await redis_client.hget(key, "payload")
    except RedisError:
        return None

    if value is None:
        return None

    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return None


async def set_cache(key: str, value: Any, ttl_seconds: int) -> None:
    try:
        await redis_client.hset(
            key,
            mapping={"payload": json.dumps(value, ensure_ascii=False)},
        )
        await redis_client.expire(key, ttl_seconds)
    except RedisError:
        # сбой кэша не должен останавливать api если основная база доступна
        pass


async def delete_cache(key: str) -> None:
    try:
        await redis_client.delete(key)
    except RedisError:
        pass


async def delete_cache_pattern(pattern: str) -> None:
    try:
        async for key in redis_client.scan_iter(match=pattern):
            await redis_client.delete(key)
    except RedisError:
        pass
