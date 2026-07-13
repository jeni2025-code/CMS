# backend/app/schemas.py

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr
from .models import RoleEnum

class Token(BaseModel):
    access_token: str
    token_type: str

class UserBase(BaseModel):
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

class UserRead(UserBase):
    id: int

class CourseBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class CourseRead(CourseBase):
    id: int

class EnrollmentBase(BaseModel):
    course_id: int
    grade: Optional[str] = None

    class Config:
        from_attributes = True

class EnrollmentRead(EnrollmentBase):
    id: int
    student_id: int
    enrolled_at: datetime
