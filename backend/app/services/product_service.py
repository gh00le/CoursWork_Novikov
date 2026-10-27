from urllib.parse import quote
from app.cache import delete_cache, delete_cache_pattern, get_cache, set_cache
from app.core.config import (
    CATALOG_CACHE_TTL_SECONDS,
    DEFAULT_PRODUCTS_LIMIT,
    PRODUCT_CACHE_TTL_SECONDS,
)
from app.core.errors import NotFoundError
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductRead


class ProductService:
    def __init__(self, repository: ProductRepository) -> None:
        self.repository = repository

    async def list_products(
        self,
        *,
        category_id: int | None = None,
        search: str | None = None,
        limit: int = DEFAULT_PRODUCTS_LIMIT,
        # offset 0 означает что выдача начинается с первого товара
        offset: int = 0,
    ) -> list[ProductRead]:
        normalized_search = (search or "").strip()
        cache_key = (
            "products:list:"
            f"category={category_id if category_id is not None else 'all'}:"
            f"search={quote(normalized_search.casefold(), safe='') or 'all'}:"
            f"limit={limit}:offset={offset}"
        )
        cached = await get_cache(cache_key)
        if cached is not None:
            return [ProductRead.model_validate(item) for item in cached]

        products = await self.repository.list_products(
            category_id=category_id,
            search=normalized_search,
            limit=limit,
            offset=offset,
        )
        result = [ProductRead.model_validate(item) for item in products]
        await set_cache(
            cache_key,
            [item.model_dump(mode="json") for item in result],
            CATALOG_CACHE_TTL_SECONDS,
        )
        return result

    async def get_product(self, product_id: int) -> ProductRead:
        cache_key = f"product:{product_id}"
        cached = await get_cache(cache_key)
        if cached is not None:
            return ProductRead.model_validate(cached)

        product = await self.repository.get_by_id(product_id)
        if product is None:
            raise NotFoundError("Product not found")

        result = ProductRead.model_validate(product)
        await set_cache(
            cache_key,
            result.model_dump(mode="json"),
            PRODUCT_CACHE_TTL_SECONDS,
        )
        return result

    @staticmethod
    async def invalidate_catalog_cache() -> None:
        await delete_cache_pattern("products:list:*")

    @staticmethod
    async def invalidate_product_cache(product_id: int) -> None:
        await delete_cache(f"product:{product_id}")
        await ProductService.invalidate_catalog_cache()
