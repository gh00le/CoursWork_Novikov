from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "SPA vs MPA Coursework API"
    DEBUG: bool = False
    DATABASE_URL: str = (
        "postgresql+asyncpg://coursework:"
        "coursework_dev_password@localhost:5432/coursework"
    )
    REDIS_URL: str = "redis://localhost:6379/0"
    CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://localhost:4173,"
        "http://localhost:3000"
    )
    DEFAULT_PRODUCTS_LIMIT: int = 20
    MAX_PRODUCTS_LIMIT: int = 100
    CATALOG_CACHE_TTL_SECONDS: int = 60
    PRODUCT_CACHE_TTL_SECONDS: int = 60
    CATEGORIES_CACHE_TTL_SECONDS: int = 300
    CART_CACHE_TTL_SECONDS: int = 30

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]


settings = Settings()
