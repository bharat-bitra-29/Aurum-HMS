from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.user import UserRole


class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    role: UserRole = UserRole.user


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    is_blocked: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
