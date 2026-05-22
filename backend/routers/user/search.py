from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from database import get_session
from services.search_service import search_hotels, get_location_suggestions
from datetime import date
from typing import Optional

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/search")
def search(
    location: Optional[str] = Query(default=None, description="City, country, area or hotel name"),
    city: Optional[str] = None,          # kept for backwards compat
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    guests: Optional[int] = Query(default=1),
    session: Session = Depends(get_session),
):
    results = search_hotels(
        session,
        location=location,
        city=city,
        check_in=check_in,
        check_out=check_out,
        min_price=min_price,
        max_price=max_price,
        guests=guests,
    )
    output = []
    for r in results:
        h = r["hotel"]
        rooms = r["rooms"]
        output.append({
            "id": h.id,
            "name": h.name,
            "description": h.description,
            "city": h.city,
            "country": h.country,
            "address": h.address,
            "star_rating": h.star_rating,
            "amenities": h.amenities,
            "min_price": min(rm.price_per_night for rm in rooms),
            "available_rooms": len(rooms),
            "rooms": [
                {
                    "id": rm.id,
                    "name": rm.name,
                    "room_type": rm.room_type,
                    "price_per_night": rm.price_per_night,
                    "capacity": rm.capacity,
                    "amenities": rm.amenities,
                    "description": rm.description,
                }
                for rm in rooms
            ],
        })
    return output


@router.get("/search/suggestions")
def location_suggestions(
    q: str = Query(min_length=2),
    session: Session = Depends(get_session),
):
    """Autocomplete endpoint for location search bar."""
    return get_location_suggestions(session, q)
