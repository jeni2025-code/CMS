

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from .api import auth, students, faculty, admin
from contextlib import asynccontextmanager
from .db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="College Management System Backend", lifespan=lifespan)

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(students.router)
app.include_router(faculty.router)
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.get("/health", tags=["monitoring"])
async def health_check():
    return {"status": "ok"}
