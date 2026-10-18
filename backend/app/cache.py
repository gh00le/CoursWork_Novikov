import json
from typing import Any

from redis import Redis
from redis.exceptions import RedisError

from app.config import REDIS_URL

redis_client = Redis.from_url(
    REDIS_URL,
    decode_responses=True,
)


def get_cache(key: str) -> Any | None:
    try:
        value = redis_client.get(key)
    except RedisError:
        return None

    if value is None:
        return None

    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return None


def set_cache(key: str, value: Any, ttl_seconds: int) -> None:
    try:
        redis_client.setex(
            key,
            ttl_seconds,
            json.dumps(value, ensure_ascii=False),
        )
    except RedisError:
        pass


def delete_cache(key: str) -> None:
    try:
        redis_client.delete(key)
    except RedisError:
        pass


def delete_cache_pattern(pattern: str) -> None:
    try:
        for key in redis_client.scan_iter(match=pattern):
            redis_client.delete(key)
    except RedisError:
        pass
