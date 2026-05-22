from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from database import get_session
from services.search_service import search_hotels
from services.hotel_service import get_hotel_by_id
from services.room_service import get_rooms_by_hotel
from datetime import date
from typing import Optional

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/hotels")
def list_hotels(
    city: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    guests: Optional[int] = None,
    session: Session = Depends(get_session),
):
    results = search_hotels(session, city, check_in, check_out, min_price, max_price, guests)
    output = []
    for r in results:
        h = r["hotel"]
        rooms = r["rooms"]
        output.append({
            "id": h.id, "name": h.name, "description": h.description,
            "city": h.city, "country": h.country, "star_rating": h.star_rating,
            "amenities": h.amenities, "address": h.address,
            "min_price": min(rm.price_per_night for rm in rooms),
            "available_rooms": len(rooms),
        })
    return output


@router.get("/hotels/map")
def hotels_for_map(session: Session = Depends(get_session)):
    """Returns all approved hotels with lat/lng for map display."""
    from models.hotel import Hotel, HotelStatus
    from sqlmodel import select
    hotels = session.exec(select(Hotel).where(
        Hotel.status == HotelStatus.approved,
        Hotel.is_suspended == False,
    )).all()
    return [
        {
            "id": h.id, "name": h.name, "city": h.city, "country": h.country,
            "latitude": h.latitude, "longitude": h.longitude,
            "star_rating": h.star_rating, "address": h.address,
        }
        for h in hotels if h.latitude != 0 and h.longitude != 0
    ]


@router.get("/hotels/{hotel_id}")
def get_hotel(hotel_id: int, session: Session = Depends(get_session)):
    from models.hotel import HotelStatus
    hotel = get_hotel_by_id(session, hotel_id)
    
    # Don't show suspended or unapproved hotels to users
    if hotel.status != HotelStatus.approved or hotel.is_suspended:
        return {"error": "Hotel not found or no longer available"}
    
    rooms = get_rooms_by_hotel(session, hotel_id)
    return {
        "hotel": hotel,
        "rooms": [r for r in rooms if r.is_available],
    }
