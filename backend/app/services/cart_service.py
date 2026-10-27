from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.cache import delete_cache, get_cache, set_cache
from app.core.config import CART_CACHE_TTL_SECONDS
from app.core.errors import BusinessRuleError, NotFoundError
from app.models import Cart, CartItem
from app.repositories.cart_repository import CartRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.cart import (
    CartCreateRead,
    CartItemCreate,
    CartItemRead,
    CartItemUpdate,
    CartProductRead,
    CartRead,
)


class CartService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.carts = CartRepository(db)
        self.products = ProductRepository(db)

    @staticmethod
    def _to_schema(cart: Cart) -> CartRead:
        items: list[CartItemRead] = []
        # нулевая сумма нужна для пустой корзины тк Decimal сохраняет точность денег
        total = Decimal("0.00")
        for item in cart.items:
            items.append(
                CartItemRead(
                    id=item.id,
                    quantity=item.quantity,
                    product=CartProductRead.model_validate(item.product),
                )
            )
            total += item.product.price * item.quantity
        return CartRead(id=cart.id, items=items, total=total)

    @staticmethod
    async def _invalidate_cart_cache(cart_id: int) -> None:
        await delete_cache(f"cart:{cart_id}")

    async def _load_cart(self, cart_id: int) -> CartRead:
        cart = await self.carts.get_with_items(cart_id)
        if cart is None:
            raise NotFoundError("Cart not found")
        return self._to_schema(cart)

    async def _cache_cart(self, cart: CartRead) -> None:
        await set_cache(
            f"cart:{cart.id}",
            cart.model_dump(mode="json"),
            CART_CACHE_TTL_SECONDS,
        )

    async def create_cart(self) -> CartCreateRead:
        cart = Cart()
        self.db.add(cart)
        await self.db.commit()
        await self.db.refresh(cart)
        return CartCreateRead(id=cart.id)

    async def get_cart(self, cart_id: int) -> CartRead:
        cache_key = f"cart:{cart_id}"
        cached = await get_cache(cache_key)
        if cached is not None:
            return CartRead.model_validate(cached)

        cart = await self._load_cart(cart_id)
        await self._cache_cart(cart)
        return cart

    async def add_item(self, cart_id: int, item_data: CartItemCreate) -> CartRead:
        if await self.carts.get_by_id(cart_id) is None:
            raise NotFoundError("Cart not found")

        product = await self.products.get_by_id(item_data.product_id)
        if product is None:
            raise NotFoundError("Product not found")
        if product.stock < item_data.quantity:
            raise BusinessRuleError("Not enough products in stock")

        item = await self.carts.get_item_by_product(cart_id, item_data.product_id)
        if item is not None:
            new_quantity = item.quantity + item_data.quantity
            if new_quantity > product.stock:
                raise BusinessRuleError("Not enough products in stock")
            item.quantity = new_quantity
        else:
            self.db.add(
                CartItem(
                    cart_id=cart_id,
                    product_id=item_data.product_id,
                    quantity=item_data.quantity,
                )
            )

        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        await self._invalidate_cart_cache(cart_id)
        updated_cart = await self._load_cart(cart_id)
        await self._cache_cart(updated_cart)
        return updated_cart

    async def update_item(
        self,
        cart_id: int,
        item_id: int,
        item_data: CartItemUpdate,
    ) -> CartRead:
        item = await self.carts.get_item(cart_id, item_id)
        if item is None:
            raise NotFoundError("Cart item not found")
        if item_data.quantity > item.product.stock:
            raise BusinessRuleError("Not enough products in stock")

        item.quantity = item_data.quantity
        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        await self._invalidate_cart_cache(cart_id)
        updated_cart = await self._load_cart(cart_id)
        await self._cache_cart(updated_cart)
        return updated_cart

    async def remove_item(self, cart_id: int, item_id: int) -> None:
        item = await self.carts.get_item(cart_id, item_id)
        if item is None:
            raise NotFoundError("Cart item not found")

        await self.db.delete(item)
        try:
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise
        await self._invalidate_cart_cache(cart_id)
