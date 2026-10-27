from typing import Annotated
from fastapi import APIRouter, Depends, Response, status
from app.api.deps import get_cart_service
from app.schemas.cart import CartCreateRead, CartItemCreate, CartItemUpdate, CartRead
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("", response_model=CartCreateRead, status_code=status.HTTP_201_CREATED)
async def create_cart(
    service: Annotated[CartService, Depends(get_cart_service)],
) -> CartCreateRead:
    return await service.create_cart()


@router.get("/{cart_id}", response_model=CartRead)
async def get_cart(
    cart_id: int,
    service: Annotated[CartService, Depends(get_cart_service)],
) -> CartRead:
    return await service.get_cart(cart_id)


@router.post(
    "/{cart_id}/items",
    response_model=CartRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_cart_item(
    cart_id: int,
    item_data: CartItemCreate,
    service: Annotated[CartService, Depends(get_cart_service)],
) -> CartRead:
    return await service.add_item(cart_id, item_data)


@router.patch("/{cart_id}/items/{item_id}", response_model=CartRead)
async def update_cart_item(
    cart_id: int,
    item_id: int,
    item_data: CartItemUpdate,
    service: Annotated[CartService, Depends(get_cart_service)],
) -> CartRead:
    return await service.update_item(cart_id, item_id, item_data)


@router.delete(
    "/{cart_id}/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_cart_item(
    cart_id: int,
    item_id: int,
    service: Annotated[CartService, Depends(get_cart_service)],
) -> Response:
    await service.remove_item(cart_id, item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
