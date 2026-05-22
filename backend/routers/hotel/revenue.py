from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from models.booking import BookingStatus
from services.hotel_service import get_hotel_by_owner
from services.booking_service import get_bookings_by_hotel
from services.commission_service import get_commissions_by_hotel, get_hotel_net_revenue
from config import settings

router = APIRouter(prefix="/api/hotel", tags=["hotel"])
guard = Depends(require_role(UserRole.hotel_admin))


@router.get("/revenue", dependencies=[guard])
def revenue(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel:
        return {"error": "No hotel registered"}
    bookings = get_bookings_by_hotel(session, hotel.id)
    commissions = get_commissions_by_hotel(session, hotel.id)
    confirmed = [b for b in bookings if b.status in [BookingStatus.confirmed, BookingStatus.completed]]
    gross = sum(b.total_amount for b in confirmed)
    net = get_hotel_net_revenue(session, hotel.id, bookings)
    return {
        "gross_revenue": gross,
        "net_revenue": net,
        "commission_paid": gross - net,
        "commission_rate": settings.COMMISSION_RATE,
        "total_bookings": len(bookings),
        "confirmed_bookings": len(confirmed),
        "commissions": commissions,
    }
