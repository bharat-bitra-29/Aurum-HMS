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
from utils.email_templates import booking_approved_by_hotel, booking_cancelled, group_booking_confirmed
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
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    booking = update_booking_status(session, booking_id, data, hotel.id)
    
    from models.user import User as UserModel
    guest = session.get(UserModel, booking.user_id)
    
    if booking.status == BookingStatus.confirmed:
        # Send approval email to guest
        create_commission(session, booking)
        if guest:
            subject, html = booking_approved_by_hotel(
                guest.full_name,
                booking.id,
                hotel.name
            )
            background_tasks.add_task(
                EmailService.send_email_sync,
                guest.email,
                subject,
                html
            )
    
    elif booking.status == BookingStatus.cancelled:
        # Send cancellation email to guest when hotel admin cancels
        if guest:
            subject, html = booking_cancelled(guest.full_name, booking.id)
            background_tasks.add_task(
                EmailService.send_email_sync,
                guest.email,
                subject,
                html
            )
    
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
    background_tasks: BackgroundTasks,
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
        
        # Send email notification if confirmed
        if gb.status == GroupBookingStatus.confirmed:
            from models.user import User as UserModel
            guest = session.get(UserModel, gb.user_id)
            if guest:
                subject, html = group_booking_confirmed(
                    guest.full_name,
                    hotel.name
                )
                background_tasks.add_task(
                    EmailService.send_email_sync,
                    guest.email,
                    subject,
                    html
                )
        
        return gb

    except NotFoundError:
        raise
    except Exception as e:
        print(f"Error updating group booking: {str(e)}")
        raise NotFoundError(f"Error: {str(e)}")
