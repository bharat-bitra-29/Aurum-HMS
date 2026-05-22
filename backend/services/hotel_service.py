import json
from sqlmodel import Session, select
from models.hotel import Hotel, HotelStatus
from schemas.hotel import HotelCreate, HotelUpdate, HotelApprove
from core.exceptions import NotFoundError, ForbiddenError
from datetime import datetime


def create_hotel(session: Session, owner_id: int, data: HotelCreate) -> Hotel:
    hotel = Hotel(
        owner_id=owner_id,
        name=data.name,
        description=data.description,
        address=data.address,
        city=data.city,
        country=data.country,
        phone=data.phone,
        email=data.email,
        star_rating=data.star_rating,
        amenities=json.dumps(data.amenities),
        latitude=data.latitude,
        longitude=data.longitude,
        status=HotelStatus.pending,
    )
    session.add(hotel)
    session.commit()
    session.refresh(hotel)
    return hotel


def get_hotel_by_owner(session: Session, owner_id: int) -> Hotel | None:
    return session.exec(select(Hotel).where(Hotel.owner_id == owner_id)).first()


def get_hotel_by_id(session: Session, hotel_id: int) -> Hotel:
    hotel = session.get(Hotel, hotel_id)
    if not hotel:
        raise NotFoundError("Hotel not found")
    return hotel


def get_all_hotels(session: Session) -> list[Hotel]:
    return session.exec(select(Hotel)).all()


def get_approved_hotels(session: Session) -> list[Hotel]:
    return session.exec(select(Hotel).where(
        Hotel.status == HotelStatus.approved,
        Hotel.is_suspended == False,
    )).all()


def approve_or_reject_hotel(session: Session, hotel_id: int, data: HotelApprove) -> Hotel:
    hotel = get_hotel_by_id(session, hotel_id)
    hotel.status = HotelStatus.approved if data.approved else HotelStatus.rejected
    hotel.rejection_reason = data.rejection_reason if not data.approved else None
    hotel.updated_at = datetime.utcnow()
    session.add(hotel)
    session.commit()
    session.refresh(hotel)
    return hotel


def update_hotel(session: Session, hotel: Hotel, data: HotelUpdate, owner_id: int) -> Hotel:
    if hotel.owner_id != owner_id:
        raise ForbiddenError("Not your hotel")
    if data.name: hotel.name = data.name
    if data.description: hotel.description = data.description
    if data.address: hotel.address = data.address
    if data.city: hotel.city = data.city
    if data.country: hotel.country = data.country
    if data.phone: hotel.phone = data.phone
    if data.email: hotel.email = data.email
    if data.star_rating: hotel.star_rating = data.star_rating
    if data.amenities is not None: hotel.amenities = json.dumps(data.amenities)
    if data.latitude is not None: hotel.latitude = data.latitude
    if data.longitude is not None: hotel.longitude = data.longitude
    hotel.updated_at = datetime.utcnow()
    session.add(hotel)
    session.commit()
    session.refresh(hotel)
    return hotel
