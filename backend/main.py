from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import create_db_and_tables, get_session
from config import settings
from sqlmodel import Session
from routers import all_routers
import os

app = FastAPI(title="Luxury Hotel Management System", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded photos
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

for router in all_routers:
    app.include_router(router)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    _seed_admin()


def _seed_admin():
    from sqlmodel import select
    from models.user import User, UserRole
    from core.security import hash_password
    session = next(get_session())
    try:
        existing = session.exec(select(User).where(User.email == "admin@luxury.com")).first()
        if not existing:
            admin = User(
                email="admin@luxury.com",
                full_name="Platform Administrator",
                hashed_password=hash_password("admin123"),
                role=UserRole.platform_admin,
            )
            session.add(admin)
            session.commit()
            print("✅ Default admin created: admin@luxury.com / admin123")
    finally:
        session.close()


@app.get("/")
def root():
    return {"message": "Aurum Hotel Management API v2", "docs": "/docs"}
