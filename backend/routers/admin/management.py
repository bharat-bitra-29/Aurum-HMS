from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from models.hotel import Hotel
from services.finance_service import (
    set_commission_tier, get_all_tiers,
    create_payout, get_payouts, process_payout,
    get_all_refunds, process_refund,
    suspend_hotel, reinstate_hotel, get_suspension_history,
)
from services.hotel_service import get_hotel_by_id
from pydantic import BaseModel
from typing import Optional
from datetime import date

router = APIRouter(prefix="/api/admin", tags=["admin-management"])
guard = Depends(require_role(UserRole.platform_admin))


# ── Bulk Hotel Actions ───────────────────────────────────────────────────────

class BulkActionIn(BaseModel):
    hotel_ids: list[int]
    action: str   # approve | reject | suspend
    reason: Optional[str] = None


@router.post("/hotels/bulk-action", dependencies=[guard])
def bulk_hotel_action(data: BulkActionIn,
                      current_user: User = Depends(require_role(UserRole.platform_admin)),
                      session: Session = Depends(get_session)):
    from models.hotel import HotelStatus
    from services.hotel_service import approve_or_reject_hotel
    from schemas.hotel import HotelApprove
    results = []
    for hid in data.hotel_ids:
        try:
            if data.action == "approve":
                approve_or_reject_hotel(session, hid, HotelApprove(approved=True))
                results.append({"id": hid, "status": "approved"})
            elif data.action == "reject":
                approve_or_reject_hotel(session, hid, HotelApprove(approved=False, rejection_reason=data.reason))
                results.append({"id": hid, "status": "rejected"})
            elif data.action == "suspend":
                suspend_hotel(session, hid, current_user.id, data.reason or "Suspended by admin")
                results.append({"id": hid, "status": "suspended"})
        except Exception as e:
            results.append({"id": hid, "error": str(e)})
    return {"results": results}


# ── Hotel Editor ─────────────────────────────────────────────────────────────

class AdminHotelEdit(BaseModel):
    name:        Optional[str]   = None
    description: Optional[str]  = None
    city:        Optional[str]   = None
    country:     Optional[str]   = None
    address:     Optional[str]   = None
    star_rating: Optional[int]   = None
    latitude:    Optional[float] = None
    longitude:   Optional[float] = None


@router.put("/hotels/{hotel_id}/edit", dependencies=[guard])
def edit_hotel(hotel_id: int, data: AdminHotelEdit,
               session: Session = Depends(get_session)):
    hotel = get_hotel_by_id(session, hotel_id)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(hotel, k, v)
    from datetime import datetime
    hotel.updated_at = datetime.utcnow()
    session.add(hotel)
    session.commit()
    session.refresh(hotel)
    return hotel


# ── Suspension ───────────────────────────────────────────────────────────────

class SuspendIn(BaseModel):
    reason: str


@router.post("/hotels/{hotel_id}/suspend", dependencies=[guard])
def suspend(hotel_id: int, data: SuspendIn,
            current_user: User = Depends(require_role(UserRole.platform_admin)),
            session: Session = Depends(get_session)):
    return suspend_hotel(session, hotel_id, current_user.id, data.reason)


@router.post("/hotels/{hotel_id}/reinstate", dependencies=[guard])
def reinstate(hotel_id: int, session: Session = Depends(get_session)):
    return reinstate_hotel(session, hotel_id)


@router.get("/hotels/{hotel_id}/suspensions", dependencies=[guard])
def suspension_history(hotel_id: int, session: Session = Depends(get_session)):
    return get_suspension_history(session, hotel_id)


# ── Commission Tiers ─────────────────────────────────────────────────────────

class TierIn(BaseModel):
    hotel_id: int
    rate:     float
    label:    str = "Standard"


@router.get("/commission-tiers", dependencies=[guard])
def list_tiers(session: Session = Depends(get_session)):
    return get_all_tiers(session)


@router.post("/commission-tiers", dependencies=[guard])
def set_tier(data: TierIn,
             current_user: User = Depends(require_role(UserRole.platform_admin)),
             session: Session = Depends(get_session)):
    return set_commission_tier(session, data.hotel_id, data.rate, data.label, current_user.id)


# ── Payouts ──────────────────────────────────────────────────────────────────

class PayoutIn(BaseModel):
    hotel_id:     int
    period_start: date
    period_end:   date


@router.get("/payouts", dependencies=[guard])
def list_payouts(hotel_id: Optional[int] = None, session: Session = Depends(get_session)):
    return get_payouts(session, hotel_id)


@router.post("/payouts", dependencies=[guard])
def create_payout_route(data: PayoutIn, session: Session = Depends(get_session)):
    return create_payout(session, data.hotel_id, data.period_start, data.period_end)


@router.post("/payouts/{payout_id}/process", dependencies=[guard])
def process_payout_route(payout_id: int, session: Session = Depends(get_session)):
    return process_payout(session, payout_id)


# ── Refunds ──────────────────────────────────────────────────────────────────

class RefundDecision(BaseModel):
    approved:   bool
    admin_note: str = ""


@router.get("/refunds", dependencies=[guard])
def list_refunds(session: Session = Depends(get_session)):
    return get_all_refunds(session)


@router.post("/refunds/{refund_id}/process", dependencies=[guard])
def process_refund_route(refund_id: int, data: RefundDecision,
                         session: Session = Depends(get_session)):
    return process_refund(session, refund_id, data.approved, data.admin_note)
