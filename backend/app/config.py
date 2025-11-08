from functools import lru_cache
from typing import Optional

from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(env_prefix="APP_", env_file=(".env", ".env.local"), case_sensitive=False)

    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    project_name: str = "zh-bn-legal-corpus"

    database_url: AnyUrl = "postgresql+asyncpg://postgres:postgres@db:5432/zhbn_legal"
    sync_database_url: Optional[AnyUrl] = None

    cors_origins: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()


settings = get_settings()
