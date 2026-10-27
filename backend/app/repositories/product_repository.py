from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Product


class ProductRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_products(
        self,
        *,
        category_id: int | None,
        search: str,
        limit: int,
        offset: int,
    ) -> list[Product]:
        query = select(Product)

        if category_id is not None:
            query = query.where(Product.category_id == category_id)
        if search:
            query = query.where(Product.name.ilike(f"%{search}%"))

        # limit и offset приходят из api; верхняя граница limit задана в конфигурации
        query = query.order_by(Product.id).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, product_id: int) -> Product | None:
        return await self.db.get(Product, product_id)

    async def lock_by_ids(self, product_ids: list[int]) -> dict[int, Product]:
        if not product_ids:
            return {}
        query = (
            select(Product)
            .where(Product.id.in_(product_ids))
            .order_by(Product.id)
            .with_for_update()
        )
        result = await self.db.execute(query)
        products = result.scalars().all()
        return {product.id: product for product in products}
