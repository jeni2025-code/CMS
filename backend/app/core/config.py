```python
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
    DATABASE_URL: PostgresDsn = Field(...)

    # FastAPI Users
    SECRET: str = Field(..., min_length=32)
    BACKEND_CORS_ORIGINS: list[str] = ["*"]


settings = Settings()
```
