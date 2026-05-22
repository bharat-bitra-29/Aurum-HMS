from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from core.dependencies import require_role
from models.user import User, UserRole
from models.hotel import Hotel
from models.booking import Booking, BookingStatus
from models.commission import Commission
from services.commission_service import get_platform_total

router = APIRouter(prefix="/api/admin", tags=["admin"])
guard = Depends(require_role(UserRole.platform_admin))


@router.get("/dashboard", dependencies=[guard])
def dashboard(session: Session = Depends(get_session)):
    total_hotels = len(session.exec(select(Hotel)).all())
    total_users = len(session.exec(select(User).where(User.role == UserRole.user)).all())
    total_bookings = len(session.exec(select(Booking)).all())
    total_revenue = get_platform_total(session)
    pending_hotels = len(session.exec(select(Hotel).where(Hotel.status == "pending")).all())
    active_bookings = len(session.exec(select(Booking).where(Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]))).all())
    return {
        "total_hotels": total_hotels,
        "total_users": total_users,
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "pending_hotels": pending_hotels,
        "active_bookings": active_bookings,
    }