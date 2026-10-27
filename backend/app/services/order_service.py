from decimal import Decimal
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.cache import delete_cache
from app.core.errors import BusinessRuleError, NotFoundError
from app.models import CartItem, Order, OrderItem, Product
from app.repositories.cart_repository import CartRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.order import OrderRead
from app.services.product_service import ProductService


class OrderService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.carts = CartRepository(db)
        self.products = ProductRepository(db)
        self.orders = OrderRepository(db)

    @staticmethod
    def _calculate_total(
        cart_items: Sequence[CartItem], locked_products: dict[int, Product]
    ) -> Decimal:
        # сумма начинается с decimal, чтобы избежать погрешности float при расчёте денег
        total_amount = Decimal("0.00")
        for item in cart_items:
            product = locked_products[item.product_id]
            if item.quantity > product.stock:
                raise BusinessRuleError(f"Not enough stock for product {product.name}")
            total_amount += product.price * item.quantity
        return total_amount

    async def create_order(self, cart_id: int) -> OrderRead:
        cart = await self.carts.get_with_items(cart_id)
        if cart is None:
            raise NotFoundError("Cart not found")
        if not cart.items:
            raise BusinessRuleError("Cart is empty")

        changed_product_ids = sorted({item.product_id for item in cart.items})
        try:
            # сортировка id снижает риск взаимной блокировки при параллельных заказах
            locked_products = await self.products.lock_by_ids(changed_product_ids)
            if len(locked_products) != len(changed_product_ids):
                raise BusinessRuleError("One or more products are no longer available")

            total_amount = self._calculate_total(cart.items, locked_products)
            order = Order(total_amount=total_amount, status="created")
            self.db.add(order)
            await self.db.flush()

            for item in list(cart.items):
                product = locked_products[item.product_id]
                product.stock -= item.quantity
                self.db.add(
                    OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        product_name=product.name,
                        price=product.price,
                        quantity=item.quantity,
                    )
                )
                await self.db.delete(item)

            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        await delete_cache(f"cart:{cart_id}")
        for product_id in changed_product_ids:
            await ProductService.invalidate_product_cache(product_id)

        created_order = await self.orders.get_by_id(order.id)
        if created_order is None:
            raise NotFoundError("Created order could not be loaded")
        return OrderRead.model_validate(created_order)

    async def get_order(self, order_id: int) -> OrderRead:
        order = await self.orders.get_by_id(order_id)
        if order is None:
            raise NotFoundError("Order not found")
        return OrderRead.model_validate(order)
