from typing import Annotated
from fastapi import APIRouter, Depends
from app.api.deps import get_category_service
from app.schemas.category import CategoryRead
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
async def list_categories(
    service: Annotated[CategoryService, Depends(get_category_service)],
) -> list[CategoryRead]:
    return await service.list_categories()
