# backend/app/models.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum, Table
from sqlalchemy.orm import relationship, declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class RoleEnum(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"

# Association table for many‑to‑many courses and faculty members
course_faculty = Table(
    "course_faculty",
    Base.metadata,
    Column("course_id", ForeignKey("courses.id"), primary_key=True),
    Column("faculty_id", ForeignKey("users.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.STUDENT)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    courses_taught = relationship(
        "Course",
        secondary=course_faculty,
        back_populates="faculty_members",
    )

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    faculty_members = relationship(
        "User",
        secondary=course_faculty,
        back_populates="courses_taught",
    )

class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = ( 
        # Ensure a student cannot enroll twice in the same course
        # (student_id, course_id) unique constraint
        {
            "sqlite_autoincrement": True,
        },
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    grade = Column(String, nullable=True)

    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
