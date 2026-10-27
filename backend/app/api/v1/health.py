from fastapi import APIRouter
from app.schemas.health import HealthRead

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthRead)
def health_check() -> HealthRead:
    return HealthRead(status="ok")
