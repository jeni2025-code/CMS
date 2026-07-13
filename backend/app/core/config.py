# backend/app/core/config.py

from pydantic import BaseSettings, PostgresDsn, Field

class Settings(BaseSettings):
    # Application
    APP_TITLE: str = "College Management System Backend"
    DEBUG: bool = False

    # Database
    DATABASE_URL: PostgresDsn = Field(..., env="DATABASE_URL")

    # FastAPI Users
    SECRET: str = Field(..., env="SECRET", min_length=32)
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
