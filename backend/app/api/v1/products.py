from typing import Annotated
from fastapi import APIRouter, Depends, Path, Query
from app.api.deps import get_product_service
from app.core.config import DEFAULT_PRODUCTS_LIMIT, MAX_PRODUCTS_LIMIT
from app.schemas.product import ProductRead
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=list[ProductRead])
async def list_products(
    service: Annotated[ProductService, Depends(get_product_service)],
    category_id: Annotated[int | None, Query(gt=0)] = None,
    search: str | None = None,
    # диапазон от 1 до MAX_PRODUCTS_LIMIT это ограничение количества товаров за запрос не позволяет загружать
    # слишком много данных сразу и замедлять работу сайта
    limit: Annotated[int, Query(ge=1, le=MAX_PRODUCTS_LIMIT)] = DEFAULT_PRODUCTS_LIMIT,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[ProductRead]:
    return await service.list_products(
        category_id=category_id,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: Annotated[int, Path(gt=0)],
    service: Annotated[ProductService, Depends(get_product_service)],
) -> ProductRead:
    return await service.get_product(product_id)
