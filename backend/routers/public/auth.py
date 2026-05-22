from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from schemas.user import UserCreate
from services.user_service import create_user, authenticate_user
from core.auth import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, session: Session = Depends(get_session)):
    user = create_user(session, UserCreate(
        email=data.email,
        full_name=data.full_name,
        password=data.password,
        role=data.role,
    ))
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, full_name=user.full_name)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, session: Session = Depends(get_session)):
    user = authenticate_user(session, data.email, data.password)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, full_name=user.full_name)
