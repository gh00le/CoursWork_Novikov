from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class CartCreateRead(BaseModel):
    id: int

class CartItemCreate(BaseModel):
    # идентификатор товара должен быть положительным тк нумерация начинается с 1
    product_id: int = Field(gt=0)
    # по умолчанию добавляется одна единица товара тк нулевое количество не имеет смысла
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    # количество не может быть меньше одной единицы, а удаление выполняется отдельным endpoint
    quantity: int = Field(ge=1)


class CartProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    price: Decimal
    image_url: str | None = None


class CartItemRead(BaseModel):
    id: int
    quantity: int
    product: CartProductRead


class CartRead(BaseModel):
    id: int
    items: list[CartItemRead]
    total: Decimal
