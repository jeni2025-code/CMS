# backend/app/api/faculty.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from ..dependencies import get_current_active_user
from ..schemas import CourseRead, CourseBase
from ..models import User, Course, RoleEnum
from ..db import get_db

router = APIRouter(prefix="/faculty", tags=["faculty"])

# Ensure user is faculty
async def ensure_faculty(user: User = Depends(get_current_active_user)) -> User:
    if user.role != RoleEnum.FACULTY:
        raise HTTPException(status_code=403, detail="Faculty access required")
    return user

@router.get("/courses", response_model=List[CourseRead])
async def list_my_courses(current_user: User = Depends(ensure_faculty), db: AsyncSession = Depends(get_db)):
    # Courses where this faculty is in the association table
    result = await db.execute(
        select(Course).join(Course.faculty_members).where(User.id == current_user.id)
    )
    courses = result.scalars().unique().all()
    return courses

@router.post("/courses", response_model=CourseRead)
async def create_course(course_in: CourseBase, current_user: User = Depends(ensure_faculty), db: AsyncSession = Depends(get_db)):
    # Create a new course and assign the faculty as a member
    new_course = Course(name=course_in.name, code=course_in.code, description=course_in.description)
    db.add(new_course)
    await db.flush()  # get new_course.id
    # associate faculty
    new_course.faculty_members.append(current_user)
    await db.commit()
    await db.refresh(new_course)
    return new_course

@router.delete("/courses/{course_id}", status_code=204)
async def delete_course(course_id: int, current_user: User = Depends(ensure_faculty), db: AsyncSession = Depends(get_db)):
    # Only allow deletion if faculty is associated with the course
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user not in course.faculty_members:
        raise HTTPException(status_code=403, detail="Not authorized to delete this course")
    await db.delete(course)
    await db.commit()
    return
