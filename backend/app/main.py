from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.router import v1_router
from app.cache import is_cache_available
from app.core.config import settings
from app.core.errors import AppError


app = FastAPI(
    title=settings.APP_NAME,
    description="REST API for the React SPA and Next.js MPA prototypes.",
    version="1.0.0",
    debug=settings.DEBUG,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppError)
async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(v1_router, prefix="/api/v1")
app.include_router(v1_router, prefix="/api", include_in_schema=False)


@app.get("/health/cache", tags=["health"])
async def cache_health() -> dict[str, str]:
    """Показывает, используется ли живой Redis в приложении."""
    available = await is_cache_available()
    return {"redis": "connected" if available else "unavailable"}
