# backend/app/db.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from .core.config import settings

# Async engine
db_url = str(settings.DATABASE_URL).replace("postgres://", "postgresql://")
if "sqlite" in db_url:
    DATABASE_URL_ASYNC = db_url
else:
    DATABASE_URL_ASYNC = db_url.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL_ASYNC, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

# Provide an init_db function to create tables since we might use SQLite on Render and want tables created automatically
async def init_db():
    from .models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
