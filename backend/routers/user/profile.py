from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from schemas.user import UserRead, UserUpdate, PasswordChange
from services.user_service import update_user, change_password

router = APIRouter(prefix="/api/user", tags=["user"])
guard = Depends(require_role(UserRole.user))


@router.get("/profile", dependencies=[guard], response_model=UserRead)
def get_profile(current_user: User = Depends(require_role(UserRole.user))):
    return current_user


@router.put("/profile", dependencies=[guard], response_model=UserRead)
def update_profile(
    data: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.user)),
):
    return update_user(session, current_user, data)


@router.put("/profile/password", dependencies=[guard])
def update_password(
    data: PasswordChange,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.user)),
):
    change_password(session, current_user, data.current_password, data.new_password)
    return {"message": "Password updated successfully"}
