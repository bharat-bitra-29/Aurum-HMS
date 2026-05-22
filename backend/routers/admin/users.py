from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from models.user import UserRole
from services.user_service import get_all_users, toggle_block

router = APIRouter(prefix="/api/admin", tags=["admin"])
guard = Depends(require_role(UserRole.platform_admin))


@router.get("/users", dependencies=[guard])
def list_users(session: Session = Depends(get_session)):
    return get_all_users(session)


@router.post("/users/{user_id}/toggle-block", dependencies=[guard])
def block_user(user_id: int, session: Session = Depends(get_session)):
    return toggle_block(session, user_id)
