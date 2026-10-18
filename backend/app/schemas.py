from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    price: Decimal
    stock: int
    image_url: str | None
    category_id: int


class CartCreateRead(BaseModel):
    id: int


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    price: Decimal
    image_url: str | None


class CartItemRead(BaseModel):
    id: int
    quantity: int
    product: CartProductRead


class CartRead(BaseModel):
    id: int
    items: list[CartItemRead]
    total: Decimal


class OrderCreate(BaseModel):
    cart_id: int


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


class HealthRead(BaseModel):
    status: str
