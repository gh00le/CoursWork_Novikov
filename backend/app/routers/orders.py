from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.cache import delete_cache, delete_cache_pattern
from app.database import get_db
from app.models import Cart, CartItem, Order, OrderItem
from app.schemas import OrderCreate, OrderRead

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    cart = (
        db.query(Cart)
        .options(joinedload(Cart.items).joinedload(CartItem.product))
        .filter(Cart.id == order_data.cart_id)
        .first()
    )

    if cart is None:
        raise HTTPException(status_code=404, detail="Cart not found")

    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = Decimal("0.00")
    changed_product_ids = []

    for cart_item in cart.items:
        if cart_item.quantity > cart_item.product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for product {cart_item.product.name}",
            )

        total_amount += cart_item.product.price * cart_item.quantity
        changed_product_ids.append(cart_item.product.id)

    order = Order(total_amount=total_amount)
    db.add(order)
    db.flush()

    for cart_item in cart.items:
        product = cart_item.product
        product.stock -= cart_item.quantity

        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                price=product.price,
                quantity=cart_item.quantity,
            )
        )

    for cart_item in list(cart.items):
        db.delete(cart_item)

    db.commit()

    delete_cache(f"cart:{order_data.cart_id}")
    delete_cache_pattern("products:list:*")

    for product_id in changed_product_ids:
        delete_cache(f"product:{product_id}")

    created_order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order.id)
        .first()
    )

    return created_order


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id)
        .first()
    )

    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    return order
