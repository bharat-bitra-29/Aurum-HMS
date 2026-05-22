from sqlmodel import Session, select
from models.user import User, UserRole
from schemas.user import UserCreate, UserUpdate
from core.security import hash_password, verify_password
from core.exceptions import NotFoundError, ConflictError, BadRequestError
from datetime import datetime


def create_user(session: Session, data: UserCreate) -> User:
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise ConflictError("Email already registered")
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def get_user_by_email(session: Session, email: str) -> User:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise NotFoundError("User not found")
    return user


def authenticate_user(session: Session, email: str, password: str) -> User:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise BadRequestError("Invalid email or password")
    if user.is_blocked:
        raise BadRequestError("Account is blocked")
    return user


def get_all_users(session: Session) -> list[User]:
    return session.exec(select(User).where(User.role == UserRole.user)).all()


def toggle_block(session: Session, user_id: int) -> User:
    user = session.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    user.is_blocked = not user.is_blocked
    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def update_user(session: Session, user: User, data: UserUpdate) -> User:
    if data.full_name:
        user.full_name = data.full_name
    if data.email:
        user.email = data.email
    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def change_password(session: Session, user: User, current_password: str, new_password: str) -> User:
    if not verify_password(current_password, user.hashed_password):
        raise BadRequestError("Current password is incorrect")
    user.hashed_password = hash_password(new_password)
    user.updated_at = datetime.utcnow()
    session.add(user)
    session.commit()
    session.refresh(user)
    return user