from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    platform_admin = "platform_admin"
    hotel_admin = "hotel_admin"
    user = "user"


class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    full_name: str
    hashed_password: str
    role: UserRole = Field(default=UserRole.user)
    is_active: bool = Field(default=True)
    is_blocked: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
