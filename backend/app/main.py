from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.router import v1_router
from app.core.config import CORS_ORIGINS
from app.core.errors import AppError

app = FastAPI(
    title="SPA vs MPA Coursework API",
    description="REST API for React SPA and Next.js SSR; PostgreSQL + Redis Hashes.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
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
