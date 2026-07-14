# backend/app/api/admin.py

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel, EmailStr

from ..db import get_db
from ..models import User, Course, Enrollment, RoleEnum
from .auth import get_password_hash

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: RoleEnum
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.STUDENT
    is_superuser: bool = False


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None


class CourseRead(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class EnrollmentRead(BaseModel):
    id: int
    student_id: int
    course_id: int
    grade: Optional[str] = None

    class Config:
        from_attributes = True


# ── User endpoints ────────────────────────────────────────────────────────────

@router.get("/users", response_model=List[UserRead], tags=["admin"])
async def list_users(db: AsyncSession = Depends(get_db)):
    """List all users."""
    result = await db.execute(select(User))
    return result.scalars().all()


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED, tags=["admin"])
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user (any role)."""
    existing = await db.execute(select(User).where(User.email == user_in.email))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=True,
        is_superuser=user_in.is_superuser,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/users/{user_id}", response_model=UserRead, tags=["admin"])
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserRead, tags=["admin"])
async def update_user(user_id: int, user_in: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Update user fields."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_in.email is not None:
        user.email = user_in.email
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.is_superuser is not None:
        user.is_superuser = user_in.is_superuser
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["admin"])
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()


# ── Course endpoints ──────────────────────────────────────────────────────────

@router.get("/courses", response_model=List[CourseRead], tags=["admin"])
async def list_courses(db: AsyncSession = Depends(get_db)):
    """List all courses."""
    result = await db.execute(select(Course))
    return result.scalars().all()


@router.post("/courses", response_model=CourseRead, status_code=status.HTTP_201_CREATED, tags=["admin"])
async def create_course(course_in: CourseCreate, db: AsyncSession = Depends(get_db)):
    """Create a new course."""
    existing = await db.execute(select(Course).where(Course.code == course_in.code))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Course code already exists")
    course = Course(
        name=course_in.name,
        code=course_in.code,
        description=course_in.description,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


@router.delete("/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["admin"])
async def delete_course(course_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a course by ID."""
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    await db.delete(course)
    await db.commit()


# ── Enrollment endpoints ──────────────────────────────────────────────────────

@router.get("/enrollments", response_model=List[EnrollmentRead], tags=["admin"])
async def list_enrollments(db: AsyncSession = Depends(get_db)):
    """List all enrollments."""
    result = await db.execute(select(Enrollment))
    return result.scalars().all()


@router.delete("/enrollments/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["admin"])
async def delete_enrollment(enrollment_id: int, db: AsyncSession = Depends(get_db)):
    """Remove an enrollment."""
    result = await db.execute(select(Enrollment).where(Enrollment.id == enrollment_id))
    enrollment = result.scalars().first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    await db.delete(enrollment)
    await db.commit()
