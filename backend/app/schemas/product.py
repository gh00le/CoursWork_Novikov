from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str
    price: Decimal
    stock: int
    image_url: str | None = None
    category_id: int


class ProductListQuery(BaseModel):
    category_id: int | None = Field(default=None, gt=0)
    search: str | None = None
    # значение 20 подходит для первой загрузки, а верхняя граница 100 ограничивает нагрузку на api
    limit: int = Field(default=20, ge=1, le=100)
    # смещение 0 означает начало каталога а след страницы передают большее значение
    offset: int = Field(default=0, ge=0)
