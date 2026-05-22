from fastapi import APIRouter, Depends, BackgroundTasks
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from schemas.booking import BookingCreate, BookingRead
from services.booking_service import create_booking, get_bookings_by_user, cancel_booking
from services.loyalty_service import earn_points
from services.property_service import is_room_blacked_out, get_effective_price
from services.email_service import EmailService
from models.booking import BookingStatus
from utils.email_templates import booking_confirmation, booking_cancelled, hotel_booking_cancelled, hotel_new_booking
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/api/user", tags=["user"])
guard = Depends(require_role(UserRole.user))


class RefundRequest(BaseModel):
    reason: str
    amount: float


@router.post("/bookings", dependencies=[guard])
def book(
    data: BookingCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.user)),
):
    # Check blackout
    if is_room_blacked_out(session, data.room_id, data.check_in, data.check_out):
        from core.exceptions import BadRequestError
        raise BadRequestError("Room is blacked out for selected dates")

    # Get effective price (dynamic pricing aware)
    from models.room import Room
    room = session.get(Room, data.room_id)
    if room:
        effective = get_effective_price(session, data.room_id, data.check_in, data.check_out, room.price_per_night)
        nights = (data.check_out - data.check_in).days
        # We override total_amount after booking creation if dynamic price differs
    
    booking = create_booking(session, current_user.id, data)
    
    # Earn loyalty points
    earn_points(session, current_user.id, booking)

    # Get hotel details
    from models.hotel import Hotel
    hotel = session.get(Hotel, booking.hotel_id)
    
    # Send confirmation email to guest
    subject, html = booking_confirmation(
        current_user.full_name,
        booking.id,
        hotel.name if hotel else "—",
        str(booking.check_in),
        str(booking.check_out),
        booking.total_amount
    )
    background_tasks.add_task(
        EmailService.send_email_sync,
        current_user.email,
        subject,
        html
    )
    
    # Send new booking notification to hotel admin
    if hotel and hotel.email:
        from models.user import User as UserModel
        hotel_owner = session.get(UserModel, hotel.owner_id)
        hotel_owner_name = hotel_owner.full_name if hotel_owner else "Hotel Manager"
        
        subject_hotel, html_hotel = hotel_new_booking(
            hotel_owner_name,
            current_user.full_name,
            booking.id,
            hotel.name,
            str(booking.check_in),
            str(booking.check_out)
        )
        background_tasks.add_task(
            EmailService.send_email_sync,
            hotel.email,
            subject_hotel,
            html_hotel
        )
    
    return booking


@router.get("/bookings", dependencies=[guard])
def my_bookings(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.user)),
):
    return get_bookings_by_user(session, current_user.id)


@router.post("/bookings/{booking_id}/cancel", dependencies=[guard])
def cancel(
    booking_id: int,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.user)),
):
    booking = cancel_booking(session, booking_id, current_user.id)
    
    # Send cancellation email to guest
    subject, html = booking_cancelled(current_user.full_name, booking.id)
    background_tasks.add_task(
        EmailService.send_email_sync,
        current_user.email,
        subject,
        html
    )
    
    # Send cancellation notification to hotel admin
    from models.hotel import Hotel
    hotel = session.get(Hotel, booking.hotel_id)
    if hotel and hotel.email:
        # Get hotel owner's full name for personalization
        hotel_owner = session.get(User, hotel.owner_id)
        hotel_owner_name = hotel_owner.full_name if hotel_owner else "Hotel Manager"
        
        subject_hotel, html_hotel = hotel_booking_cancelled(
            hotel_owner_name,
            current_user.full_name,
            booking.id,
            hotel.name,
            str(booking.check_in),
            str(booking.check_out)
        )
        background_tasks.add_task(
            EmailService.send_email_sync,
            hotel.email,
            subject_hotel,
            html_hotel
        )
    
    return booking


@router.post("/bookings/{booking_id}/refund-request", dependencies=[guard])
def request_refund(
    booking_id: int,
    data: RefundRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.user)),
):
    from services.finance_service import request_refund as _request_refund
    return _request_refund(session, booking_id, current_user.id, data.amount, data.reason)
