from app.cache import get_cache, set_cache
from app.core.config import CATEGORIES_CACHE_TTL_SECONDS
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryRead


class CategoryService:
    def __init__(self, repository: CategoryRepository) -> None:
        self.repository = repository

    async def list_categories(self) -> list[CategoryRead]:
        cache_key = "categories:all"
        cached = await get_cache(cache_key)
        if cached is not None:
            return [CategoryRead.model_validate(item) for item in cached]

        categories = [
            CategoryRead.model_validate(item)
            for item in await self.repository.list_all()
        ]
        await set_cache(
            cache_key,
            [item.model_dump(mode="json") for item in categories],
            CATEGORIES_CACHE_TTL_SECONDS,
        )
        return categories
