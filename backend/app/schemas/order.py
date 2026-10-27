from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class OrderCreate(BaseModel):
    # положительный id исключает отрицательные идентификаторы и некорректные запросы
    cart_id: int = Field(gt=0)


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name: str
    price: Decimal
    quantity: int


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    items: list[OrderItemRead]
