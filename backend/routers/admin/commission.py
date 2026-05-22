from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from models.user import UserRole
from services.commission_service import get_all_commissions, get_platform_total

router = APIRouter(prefix="/api/admin", tags=["admin"])
guard = Depends(require_role(UserRole.platform_admin))


@router.get("/commission", dependencies=[guard])
def commission_overview(session: Session = Depends(get_session)):
    commissions = get_all_commissions(session)
    total = get_platform_total(session)
    return {"commissions": commissions, "total": total, "count": len(commissions)}
