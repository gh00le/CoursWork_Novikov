from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.models import Cart, CartItem


class CartRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, cart_id: int) -> Cart | None:
        return await self.db.get(Cart, cart_id)

    async def get_with_items(self, cart_id: int) -> Cart | None:
        query = (
            select(Cart)
            .options(joinedload(Cart.items).joinedload(CartItem.product))
            .where(Cart.id == cart_id)
        )
        result = await self.db.execute(query)
        return result.unique().scalar_one_or_none()

    async def get_item(self, cart_id: int, item_id: int) -> CartItem | None:
        query = (
            select(CartItem)
            .options(joinedload(CartItem.product))
            .where(CartItem.id == item_id, CartItem.cart_id == cart_id)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_item_by_product(
        self, cart_id: int, product_id: int
    ) -> CartItem | None:
        query = select(CartItem).where(
            CartItem.cart_id == cart_id,
            CartItem.product_id == product_id,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
