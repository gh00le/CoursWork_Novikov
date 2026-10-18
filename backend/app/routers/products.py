from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.cache import get_cache, set_cache
from app.config import (
    CATALOG_CACHE_TTL_SECONDS,
    DEFAULT_PRODUCTS_LIMIT,
    MAX_PRODUCTS_LIMIT,
    PRODUCT_CACHE_TTL_SECONDS,
)
from app.database import get_db
from app.models import Product
from app.schemas import ProductRead

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductRead])
def get_products(
    category_id: int | None = None,
    search: str | None = None,
    limit: int = Query(DEFAULT_PRODUCTS_LIMIT, ge=1, le=MAX_PRODUCTS_LIMIT),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    normalized_search = search.strip() if search else ""

    cache_key = (
        "products:list:"
        f"category={category_id if category_id is not None else 'all'}:"
        f"search={normalized_search.lower() if normalized_search else 'all'}:"
        f"limit={limit}:"
        f"offset={offset}"
    )

    cached_products = get_cache(cache_key)
    if cached_products is not None:
        return cached_products

    query = db.query(Product)

    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    if normalized_search:
        query = query.filter(Product.name.ilike(f"%{normalized_search}%"))

    products = (
        query.order_by(Product.id)
        .offset(offset)
        .limit(limit)
        .all()
    )

    response = [
        ProductRead.model_validate(product).model_dump(mode="json")
        for product in products
    ]

    set_cache(
        cache_key,
        response,
        CATALOG_CACHE_TTL_SECONDS,
    )

    return response


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    cache_key = f"product:{product_id}"

    cached_product = get_cache(cache_key)
    if cached_product is not None:
        return cached_product

    product = db.get(Product, product_id)

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    response = ProductRead.model_validate(product).model_dump(mode="json")

    set_cache(
        cache_key,
        response,
        PRODUCT_CACHE_TTL_SECONDS,
    )

    return response
