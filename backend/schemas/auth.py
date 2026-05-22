from pydantic import BaseModel
from models.user import UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    password: str
    role: UserRole = UserRole.user


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    full_name: str
