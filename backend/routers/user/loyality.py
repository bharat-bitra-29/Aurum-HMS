from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from services.loyalty_service import get_or_create_account, get_transactions, redeem_points
from pydantic import BaseModel

router = APIRouter(prefix="/api/user", tags=["user-loyalty"])
guard = Depends(require_role(UserRole.user))


class RedeemRequest(BaseModel):
    points: int


@router.get("/loyalty", dependencies=[guard])
def loyalty_account(current_user: User = Depends(require_role(UserRole.user)),
                    session: Session = Depends(get_session)):
    acc = get_or_create_account(session, current_user.id)
    return {
        "points": acc.points,
        "lifetime_earned": acc.lifetime_earned,
        "dollar_value": acc.points / 100,
    }


@router.get("/loyalty/transactions", dependencies=[guard])
def loyalty_transactions(current_user: User = Depends(require_role(UserRole.user)),
                         session: Session = Depends(get_session)):
    return get_transactions(session, current_user.id)


@router.post("/loyalty/redeem", dependencies=[guard])
def redeem(data: RedeemRequest,
           current_user: User = Depends(require_role(UserRole.user)),
           session: Session = Depends(get_session)):
    discount = redeem_points(session, current_user.id, data.points)
    return {"discount_applied": discount, "message": f"${discount:.2f} discount applied to next booking"}
