from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlmodel import Session, select
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from models.booking import Booking, BookingStatus
from models.room import Room
from models.property import PricingType
from models.messaging import SenderRole
from services.hotel_service import get_hotel_by_owner
from services.property_service import (
    set_dynamic_price, get_dynamic_prices, delete_dynamic_price,
    add_blackout, get_blackouts, delete_blackout,
    save_photo, get_photos, delete_photo,
)
from services.messaging_service import send_message, get_messages, mark_read
from services.group_booking_service import get_group_bookings_by_hotel
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
import base64

router = APIRouter(prefix="/api/hotel", tags=["hotel-property"])
guard = Depends(require_role(UserRole.hotel_admin))


# ── Dynamic Pricing ──────────────────────────────────────────────────────────

class DynamicPriceIn(BaseModel):
    room_id:      int
    pricing_type: PricingType = PricingType.custom
    label:        str = ""
    start_date:   date
    end_date:     date
    price_per_night: float


@router.get("/dynamic-pricing", dependencies=[guard])
def list_pricing(current_user: User = Depends(require_role(UserRole.hotel_admin)),
                 session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel: return []
    return get_dynamic_prices(session, hotel.id)


@router.post("/dynamic-pricing", dependencies=[guard])
def add_pricing(data: DynamicPriceIn,
                current_user: User = Depends(require_role(UserRole.hotel_admin)),
                session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    return set_dynamic_price(session, hotel.id, data.room_id, data.model_dump(exclude={"room_id"}))


@router.delete("/dynamic-pricing/{price_id}", dependencies=[guard])
def del_pricing(price_id: int,
                current_user: User = Depends(require_role(UserRole.hotel_admin)),
                session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    delete_dynamic_price(session, price_id, hotel.id)
    return {"message": "Deleted"}


# ── Blackout Dates ───────────────────────────────────────────────────────────

class BlackoutIn(BaseModel):
    room_id:    int
    start_date: date
    end_date:   date
    reason:     str = "Maintenance"


@router.get("/blackout-dates", dependencies=[guard])
def list_blackouts(current_user: User = Depends(require_role(UserRole.hotel_admin)),
                   session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel: return []
    return get_blackouts(session, hotel.id)


@router.post("/blackout-dates", dependencies=[guard])
def add_blackout_route(data: BlackoutIn,
                       current_user: User = Depends(require_role(UserRole.hotel_admin)),
                       session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    return add_blackout(session, hotel.id, data.room_id, data.model_dump(exclude={"room_id"}))


@router.delete("/blackout-dates/{bd_id}", dependencies=[guard])
def del_blackout(bd_id: int,
                 current_user: User = Depends(require_role(UserRole.hotel_admin)),
                 session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    delete_blackout(session, bd_id, hotel.id)
    return {"message": "Deleted"}


# ── Photos ───────────────────────────────────────────────────────────────────

class PhotoIn(BaseModel):
    data_url:  str           # base64 data URL
    caption:   str = ""
    room_id:   Optional[int] = None


@router.get("/photos", dependencies=[guard])
def list_photos(room_id: Optional[int] = None,
                current_user: User = Depends(require_role(UserRole.hotel_admin)),
                session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel: return []
    return get_photos(session, hotel.id, room_id)


@router.post("/photos", dependencies=[guard])
def upload_photo(data: PhotoIn,
                 current_user: User = Depends(require_role(UserRole.hotel_admin)),
                 session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    return save_photo(session, hotel.id, data.room_id, data.data_url, data.caption)


@router.delete("/photos/{photo_id}", dependencies=[guard])
def del_photo(photo_id: int,
              current_user: User = Depends(require_role(UserRole.hotel_admin)),
              session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    delete_photo(session, photo_id, hotel.id)
    return {"message": "Deleted"}


# ── Gantt / Calendar ─────────────────────────────────────────────────────────

@router.get("/calendar", dependencies=[guard])
def booking_calendar(current_user: User = Depends(require_role(UserRole.hotel_admin)),
                     session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel: return {"rooms": [], "bookings": []}
    rooms = session.exec(select(Room).where(Room.hotel_id == hotel.id)).all()
    bookings = session.exec(
        select(Booking).where(
            Booking.hotel_id == hotel.id,
            Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
        )
    ).all()
    blackouts = get_blackouts(session, hotel.id)
    return {
        "rooms": [{"id": r.id, "name": r.name, "room_type": r.room_type} for r in rooms],
        "bookings": [
            {"id": b.id, "room_id": b.room_id, "check_in": str(b.check_in),
             "check_out": str(b.check_out), "status": b.status, "guests": b.guests} for b in bookings
        ],
        "blackouts": [
            {"id": bd.id, "room_id": bd.room_id, "start_date": str(bd.start_date),
             "end_date": str(bd.end_date), "reason": bd.reason} for bd in blackouts
        ],
    }


# ── Check-in / Check-out Tracker ─────────────────────────────────────────────

@router.get("/today-tracker", dependencies=[guard])
def today_tracker(current_user: User = Depends(require_role(UserRole.hotel_admin)),
                  session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel: return {"arrivals": [], "departures": [], "in_house": []}
    today = datetime.utcnow().date()
    all_bookings = session.exec(
        select(Booking).where(
            Booking.hotel_id == hotel.id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.completed]),
        )
    ).all()
    return {
        "arrivals":   [b for b in all_bookings if b.check_in  == today],
        "departures": [b for b in all_bookings if b.check_out == today],
        "in_house":   [b for b in all_bookings if b.check_in < today < b.check_out],
        "date":       str(today),
    }


# ── Hotel Messaging ──────────────────────────────────────────────────────────

class HotelMsgIn(BaseModel):
    body: str


@router.get("/bookings/{booking_id}/messages", dependencies=[guard])
def hotel_messages(booking_id: int,
                   current_user: User = Depends(require_role(UserRole.hotel_admin)),
                   session: Session = Depends(get_session)):
    mark_read(session, booking_id, SenderRole.hotel)
    return get_messages(session, booking_id)


@router.post("/bookings/{booking_id}/messages", dependencies=[guard])
def hotel_send_msg(booking_id: int, data: HotelMsgIn,
                   current_user: User = Depends(require_role(UserRole.hotel_admin)),
                   session: Session = Depends(get_session)):
    booking = session.get(Booking, booking_id)
    return send_message(
        session,
        booking_id=booking_id,
        hotel_id=booking.hotel_id,
        user_id=booking.user_id,
        sender_id=current_user.id,
        sender_role=SenderRole.hotel,
        body=data.body,
    )


# ── Group Bookings (hotel view) ───────────────────────────────────────────────

@router.get("/group-bookings", dependencies=[guard])
def hotel_group_bookings(current_user: User = Depends(require_role(UserRole.hotel_admin)),
                         session: Session = Depends(get_session)):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel: return []
    return get_group_bookings_by_hotel(session, hotel.id)
