from typing import Annotated
from fastapi import APIRouter, Depends, status
from app.api.deps import get_order_service
from app.schemas.order import OrderCreate, OrderRead
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    service: Annotated[OrderService, Depends(get_order_service)],
) -> OrderRead:
    return await service.create_order(order_data.cart_id)


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: int,
    service: Annotated[OrderService, Depends(get_order_service)],
) -> OrderRead:
    return await service.get_order(order_id)
