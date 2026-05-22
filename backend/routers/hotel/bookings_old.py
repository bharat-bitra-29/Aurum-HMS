from fastapi import APIRouter, Depends, BackgroundTasks
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from core.exceptions import NotFoundError
from models.user import UserRole, User
from schemas.booking import StatusUpdate
from services.hotel_service import get_hotel_by_owner
from services.booking_service import get_bookings_by_hotel, update_booking_status
from services.commission_service import create_commission
from services.group_booking_service import get_group_bookings_by_hotel, update_group_status
from services.email_service import EmailService
from models.booking import BookingStatus
from models.group_booking import GroupBooking, GroupBookingStatus
from utils.email_templates import booking_approved_by_hotel, group_booking_confirmed
from pydantic import BaseModel

router = APIRouter(prefix="/api/hotel", tags=["hotel"])
guard = Depends(require_role(UserRole.hotel_admin))


class GroupBookingStatusUpdate(BaseModel):
    status: str  # Accept string instead of enum

    def get_status(self) -> GroupBookingStatus:
        """Convert string to GroupBookingStatus enum"""
        try:
            return GroupBookingStatus(self.status)
        except ValueError:
            raise NotFoundError(f"Invalid status: {self.status}. Must be: pending, confirmed, or cancelled")


@router.get("/bookings", dependencies=[guard])
def list_bookings(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel:
        return []
    return get_bookings_by_hotel(session, hotel.id)


@router.put("/bookings/{booking_id}/status", dependencies=[guard])
def change_status(
    booking_id: int,
    data: StatusUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    booking = update_booking_status(session, booking_id, data, hotel.id)
    if booking.status == BookingStatus.confirmed:
        create_commission(session, booking)
    return booking


@router.get("/group-bookings", dependencies=[guard])
def list_group_bookings(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel:
        return []
    return get_group_bookings_by_hotel(session, hotel.id)


@router.put("/group-bookings/{gb_id}/status", dependencies=[guard])
def update_group_booking_status(
    gb_id: int,
    data: GroupBookingStatusUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    try:
        # Get hotel for this manager
        hotel = get_hotel_by_owner(session, current_user.id)
        if not hotel:
            raise NotFoundError(f"No hotel found for user {current_user.id}")

        # Get the group booking
        gb = session.get(GroupBooking, gb_id)
        if not gb:
            raise NotFoundError(f"Group booking {gb_id} not found in database")

        # Verify it belongs to this hotel
        if gb.hotel_id != hotel.id:
            raise NotFoundError(f"Group booking {gb_id} belongs to hotel {gb.hotel_id}, not {hotel.id}")

        # Convert and update status
        status_enum = data.get_status()
        gb = update_group_status(session, gb_id, status_enum)
        return gb

    except NotFoundError:
        raise
    except Exception as e:
        print(f"Error updating group booking: {str(e)}")
        raise NotFoundError(f"Error: {str(e)}")
