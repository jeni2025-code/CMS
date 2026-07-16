# backend/app/core/config.py

from pydantic import Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # Application
    APP_TITLE: str = "College Management System Backend"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./cms.db"

    # FastAPI Users
    SECRET: str = "supersecretfallbackkey1234567890123"
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

settings = Settings()

