from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.models import Order


class OrderRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, order_id: int) -> Order | None:
        query = (
            select(Order).options(joinedload(Order.items)).where(Order.id == order_id)
        )
        result = await self.db.execute(query)
        return result.unique().scalar_one_or_none()
