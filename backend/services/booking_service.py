from sqlmodel import Session, select
from models.booking import Booking, BookingStatus
from models.room import Room
from schemas.booking import BookingCreate, StatusUpdate
from core.exceptions import NotFoundError, BadRequestError, ForbiddenError
from datetime import datetime, date


def check_availability(session: Session, room_id: int, check_in: date, check_out: date, exclude_booking_id: int = None) -> bool:
    query = select(Booking).where(
        Booking.room_id == room_id,
        Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )
    if exclude_booking_id:
        query = query.where(Booking.id != exclude_booking_id)
    conflict = session.exec(query).first()
    return conflict is None


def create_booking(session: Session, user_id: int, data: BookingCreate) -> Booking:
    if data.check_in >= data.check_out:
        raise BadRequestError("Check-out must be after check-in")
    if data.check_in < date.today():
        raise BadRequestError("Check-in cannot be in the past")

    room = session.get(Room, data.room_id)
    if not room:
        raise NotFoundError("Room not found")
    if not room.is_available:
        raise BadRequestError("Room is not available")

    if not check_availability(session, data.room_id, data.check_in, data.check_out):
        raise BadRequestError("Room is already booked for selected dates")

    nights = (data.check_out - data.check_in).days
    total_amount = nights * room.price_per_night

    booking = Booking(
        user_id=user_id,
        room_id=data.room_id,
        hotel_id=data.hotel_id,
        check_in=data.check_in,
        check_out=data.check_out,
        guests=data.guests,
        total_amount=total_amount,
        special_requests=data.special_requests,
        status=BookingStatus.pending,
    )
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


def get_bookings_by_user(session: Session, user_id: int) -> list[Booking]:
    return session.exec(select(Booking).where(Booking.user_id == user_id)).all()


def get_bookings_by_hotel(session: Session, hotel_id: int) -> list[Booking]:
    return session.exec(select(Booking).where(Booking.hotel_id == hotel_id)).all()


def get_booking_by_id(session: Session, booking_id: int) -> Booking:
    booking = session.get(Booking, booking_id)
    if not booking:
        raise NotFoundError("Booking not found")
    return booking


def update_booking_status(session: Session, booking_id: int, data: StatusUpdate, hotel_id: int = None) -> Booking:
    booking = get_booking_by_id(session, booking_id)
    if hotel_id and booking.hotel_id != hotel_id:
        raise ForbiddenError("Not your booking")
    
    # Check if trying to cancel after check-in date
    if data.status == BookingStatus.cancelled and date.today() >= booking.check_in:
        raise BadRequestError("Cannot cancel booking after check-in date. The stay has already begun or started today.")
    
    booking.status = data.status
    booking.updated_at = datetime.utcnow()
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


def cancel_booking(session: Session, booking_id: int, user_id: int) -> Booking:
    booking = get_booking_by_id(session, booking_id)
    if booking.user_id != user_id:
        raise ForbiddenError("Not your booking")
    if booking.status == BookingStatus.completed:
        raise BadRequestError("Cannot cancel a completed booking")
    
    # Check if check-in date has passed
    if date.today() >= booking.check_in:
        raise BadRequestError("Cannot cancel booking after check-in date. The stay has already begun or started today.")
    
    booking.status = BookingStatus.cancelled
    booking.updated_at = datetime.utcnow()
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


def get_all_bookings(session: Session) -> list[Booking]:
    return session.exec(select(Booking)).all()
