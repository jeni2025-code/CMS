# Online College Management System

A full‑stack application built with **FastAPI** (Python) for the backend and **Next.js 14** for the frontend.

## Features
- Student portal (profile, enrollment, grades)
- Faculty portal (course creation, attendance, grading)
- Admin dashboard (user & course management, reports)
- JWT authentication
- Email notifications
- Optional Stripe payment integration
- Responsive, premium UI with glass‑morphism and micro‑animations

## Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev without Docker)
- Python 3.11+

## Development
```bash
# Start all services
docker compose up --build

# Backend API docs: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

## Project Structure
```
CollegeManagementSystem/
├─ backend/        # FastAPI service
├─ frontend/       # Next.js app
├─ docker-compose.yml
└─ README.md
```
# CMS
