from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.cache import get_cache, set_cache
from app.config import CATEGORIES_CACHE_TTL_SECONDS
from app.database import get_db
from app.models import Category
from app.schemas import CategoryRead

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
def get_categories(db: Session = Depends(get_db)):
    cache_key = "categories:all"

    cached_categories = get_cache(cache_key)
    if cached_categories is not None:
        return cached_categories

    categories = db.query(Category).order_by(Category.name).all()

    response = [
        CategoryRead.model_validate(category).model_dump(mode="json")
        for category in categories
    ]

    set_cache(
        cache_key,
        response,
        CATEGORIES_CACHE_TTL_SECONDS,
    )

    return response
