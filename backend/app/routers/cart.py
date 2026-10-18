from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from app.cache import delete_cache, get_cache, set_cache
from app.config import CART_CACHE_TTL_SECONDS
from app.database import get_db
from app.models import Cart, CartItem, Product
from app.schemas import (
    CartCreateRead,
    CartItemCreate,
    CartItemRead,
    CartItemUpdate,
    CartProductRead,
    CartRead,
)

router = APIRouter(prefix="/api/cart", tags=["cart"])


def build_cart_response(cart: Cart) -> CartRead:
    items = []
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


def get_cart_with_items(db: Session, cart_id: int) -> Cart | None:
    return (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.id == cart_id)
        .first()
    )


def save_cart_cache(cart_response: CartRead) -> None:
    set_cache(
        f"cart:{cart_response.id}",
        cart_response.model_dump(mode="json"),
        CART_CACHE_TTL_SECONDS,
    )


@router.post("", response_model=CartCreateRead, status_code=status.HTTP_201_CREATED)
def create_cart(db: Session = Depends(get_db)):
    cart = Cart()
    db.add(cart)
    db.commit()
    db.refresh(cart)

    return CartCreateRead(id=cart.id)


@router.get("/{cart_id}", response_model=CartRead)
def get_cart(cart_id: int, db: Session = Depends(get_db)):
    cache_key = f"cart:{cart_id}"

    cached_cart = get_cache(cache_key)
    if cached_cart is not None:
        return cached_cart

    cart = get_cart_with_items(db, cart_id)

    if cart is None:
        raise HTTPException(status_code=404, detail="Cart not found")

    response = build_cart_response(cart)
    save_cart_cache(response)

    return response


@router.post(
    "/{cart_id}/items",
    response_model=CartRead,
    status_code=status.HTTP_201_CREATED,
)
def add_item_to_cart(
    cart_id: int,
    item_data: CartItemCreate,
    db: Session = Depends(get_db),
):
    cart = db.get(Cart, cart_id)
    if cart is None:
        raise HTTPException(status_code=404, detail="Cart not found")

    product = db.get(Product, item_data.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    if item_data.quantity > product.stock:
        raise HTTPException(status_code=400, detail="Not enough products in stock")

    existing_item = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart_id,
            CartItem.product_id == item_data.product_id,
        )
        .first()
    )

    if existing_item:
        new_quantity = existing_item.quantity + item_data.quantity

        if new_quantity > product.stock:
            raise HTTPException(status_code=400, detail="Not enough products in stock")

        existing_item.quantity = new_quantity
    else:
        db.add(
            CartItem(
                cart_id=cart_id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
            )
        )

    db.commit()

    delete_cache(f"cart:{cart_id}")

    updated_cart = get_cart_with_items(db, cart_id)
    response = build_cart_response(updated_cart)
    save_cart_cache(response)

    return response


@router.patch("/{cart_id}/items/{item_id}", response_model=CartRead)
def update_cart_item(
    cart_id: int,
    item_id: int,
    item_data: CartItemUpdate,
    db: Session = Depends(get_db),
):
    item = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.id == item_id, CartItem.cart_id == cart_id)
        .first()
    )

    if item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if item_data.quantity > item.product.stock:
        raise HTTPException(status_code=400, detail="Not enough products in stock")

    item.quantity = item_data.quantity
    db.commit()

    delete_cache(f"cart:{cart_id}")

    updated_cart = get_cart_with_items(db, cart_id)
    response = build_cart_response(updated_cart)
    save_cart_cache(response)

    return response


@router.delete(
    "/{cart_id}/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_cart_item(
    cart_id: int,
    item_id: int,
    db: Session = Depends(get_db),
):
    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.cart_id == cart_id)
        .first()
    )

    if item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.commit()

    delete_cache(f"cart:{cart_id}")

    return Response(status_code=status.HTTP_204_NO_CONTENT)
