from sqlmodel import Session, select
from models.group_booking import GroupBooking, GroupBookingStatus
from models.user import User
from models.room import Room
from models.hotel import Hotel
from core.exceptions import BadRequestError, NotFoundError
from datetime import date, datetime


GROUP_DISCOUNT_PCT   = 10.0   # 10% for 5+ rooms
MIN_ROOMS_FOR_GROUP  = 5


def create_group_booking(session: Session, user_id: int, data: dict) -> GroupBooking:
    num_rooms = data.get("num_rooms", 0)
    if num_rooms < MIN_ROOMS_FOR_GROUP:
        raise BadRequestError(f"Group booking requires at least {MIN_ROOMS_FOR_GROUP} rooms")

    check_in  = data["check_in"]
    check_out = data["check_out"]
    if check_in >= check_out:
        raise BadRequestError("Check-out must be after check-in")
    if check_in < date.today():
        raise BadRequestError("Check-in cannot be in the past")

    hotel = session.get(Hotel, data["hotel_id"])
    if not hotel:
        raise NotFoundError("Hotel not found")

    # Find available rooms of requested type
    rooms = session.exec(
        select(Room).where(
            Room.hotel_id == data["hotel_id"],
            Room.room_type == data.get("room_type", "standard"),
            Room.is_available == True,
        )
    ).all()

    if len(rooms) < num_rooms:
        raise BadRequestError(f"Only {len(rooms)} rooms of this type available")

    nights = (check_out - check_in).days
    base_price = min(r.price_per_night for r in rooms)
    base_amount = base_price * nights * num_rooms
    discount    = base_amount * (GROUP_DISCOUNT_PCT / 100)
    total       = base_amount - discount

    gb = GroupBooking(
        user_id=user_id,
        hotel_id=data["hotel_id"],
        room_type=data.get("room_type", "standard"),
        num_rooms=num_rooms,
        check_in=check_in,
        check_out=check_out,
        guests_per_room=data.get("guests_per_room", 2),
        total_guests=num_rooms * data.get("guests_per_room", 2),
        base_amount=base_amount,
        discount_pct=GROUP_DISCOUNT_PCT,
        total_amount=total,
        special_requests=data.get("special_requests", ""),
        contact_name=data.get("contact_name", ""),
        contact_phone=data.get("contact_phone", ""),
    )
    session.add(gb)
    session.commit()
    session.refresh(gb)

    return gb


def get_group_bookings_by_user(session: Session, user_id: int) -> list[GroupBooking]:
    return session.exec(select(GroupBooking).where(GroupBooking.user_id == user_id)).all()


def get_group_bookings_by_hotel(session: Session, hotel_id: int) -> list[GroupBooking]:
    return session.exec(select(GroupBooking).where(GroupBooking.hotel_id == hotel_id)).all()


def update_group_status(session: Session, gb_id: int, status: GroupBookingStatus) -> GroupBooking:
    gb = session.get(GroupBooking, gb_id)
    if not gb:
        raise NotFoundError("Group booking not found")

    gb.status = status
    session.add(gb)
    session.commit()
    session.refresh(gb)

    return gb
