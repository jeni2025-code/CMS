# backend/app/api/students.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert

from ..dependencies import get_current_active_user
from ..schemas import CourseRead, EnrollmentRead, EnrollmentBase, UserRead
from ..models import User, Course, Enrollment, RoleEnum
from ..db import get_db

router = APIRouter(prefix="/students", tags=["students"])

# Helper to ensure user is student
async def ensure_student(user: User = Depends(get_current_active_user)) -> User:
    if user.role != RoleEnum.STUDENT:
        raise HTTPException(status_code=403, detail="Student access required")
    return user

@router.get("/me", response_model=UserRead)
async def read_current_student(current_user: User = Depends(ensure_student)):
    return current_user

@router.get("/courses", response_model=List[CourseRead])
async def list_available_courses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course))
    courses = result.scalars().all()
    return courses

@router.post("/enroll", response_model=EnrollmentRead)
async def enroll_course(enrollment: EnrollmentBase, current_user: User = Depends(ensure_student), db: AsyncSession = Depends(get_db)):
    # Verify course exists
    course = await db.get(Course, enrollment.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    # Prevent duplicate enrollment
    existing = await db.execute(
        select(Enrollment).where(Enrollment.student_id == current_user.id, Enrollment.course_id == enrollment.course_id)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Already enrolled")
    new_enrollment = Enrollment(student_id=current_user.id, course_id=enrollment.course_id)
    db.add(new_enrollment)
    await db.commit()
    await db.refresh(new_enrollment)
    return new_enrollment

@router.get("/enrollments", response_model=List[EnrollmentRead])
async def list_my_enrollments(current_user: User = Depends(ensure_student), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Enrollment).where(Enrollment.student_id == current_user.id))
    enrollments = result.scalars().all()
    return enrollments

@router.patch("/enrollments/{enrollment_id}", response_model=EnrollmentRead)
async def update_grade(enrollment_id: int, grade: str, current_user: User = Depends(ensure_student), db: AsyncSession = Depends(get_db)):
    enrollment = await db.get(Enrollment, enrollment_id)
    if not enrollment or enrollment.student_id != current_user.id:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.grade = grade
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment
