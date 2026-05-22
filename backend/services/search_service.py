from sqlmodel import Session, select
from models.hotel import Hotel, HotelStatus
from models.room import Room
from models.booking import Booking, BookingStatus
from datetime import date


def _location_match(hotel: Hotel, location: str) -> bool:
    """Fuzzy match location against city, country, address, and name."""
    if not location:
        return True
    q = location.lower().strip()
    return (
        q in hotel.city.lower()
        or q in hotel.country.lower()
        or q in hotel.address.lower()
        or q in hotel.name.lower()
    )


def search_hotels(
    session: Session,
    location: str = None,
    city: str = None,           # backwards compat
    check_in: date = None,
    check_out: date = None,
    min_price: float = None,
    max_price: float = None,
    guests: int = None,
) -> list[dict]:
    search_term = location or city

    hotels = session.exec(
        select(Hotel).where(
            Hotel.status == HotelStatus.approved,
            Hotel.is_suspended == False,
        )
    ).all()

    results = []
    for hotel in hotels:
        if search_term and not _location_match(hotel, search_term):
            continue

        rooms = session.exec(
            select(Room).where(
                Room.hotel_id == hotel.id,
                Room.is_available == True,
            )
        ).all()

        available_rooms = []
        for room in rooms:
            if guests and room.capacity < guests:
                continue
            if min_price and room.price_per_night < min_price:
                continue
            if max_price and room.price_per_night > max_price:
                continue
            if check_in and check_out:
                conflict = session.exec(
                    select(Booking).where(
                        Booking.room_id == room.id,
                        Booking.status.in_([BookingStatus.pending, BookingStatus.confirmed]),
                        Booking.check_in < check_out,
                        Booking.check_out > check_in,
                    )
                ).first()
                if conflict:
                    continue
            available_rooms.append(room)

        if available_rooms:
            results.append({"hotel": hotel, "rooms": available_rooms})

    return results


def get_location_suggestions(session: Session, query: str) -> list[str]:
    """Return unique location suggestions for autocomplete."""
    if not query or len(query) < 2:
        return []
    q = query.lower()
    hotels = session.exec(
        select(Hotel).where(Hotel.status == HotelStatus.approved)
    ).all()
    seen: set[str] = set()
    suggestions: list[str] = []
    for h in hotels:
        for val in [h.city, h.country, f"{h.city}, {h.country}"]:
            if q in val.lower() and val not in seen:
                seen.add(val)
                suggestions.append(val)
    return suggestions[:8]
