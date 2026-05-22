import json
from sqlmodel import Session, select
from models.room import Room
from schemas.room import RoomCreate, RoomUpdate
from core.exceptions import NotFoundError, ForbiddenError
from datetime import datetime


def create_room(session: Session, hotel_id: int, data: RoomCreate) -> Room:
    room = Room(
        hotel_id=hotel_id,
        name=data.name,
        description=data.description,
        room_type=data.room_type,
        price_per_night=data.price_per_night,
        capacity=data.capacity,
        amenities=json.dumps(data.amenities),
    )
    session.add(room)
    session.commit()
    session.refresh(room)
    return room


def get_rooms_by_hotel(session: Session, hotel_id: int) -> list[Room]:
    return session.exec(select(Room).where(Room.hotel_id == hotel_id)).all()


def get_room_by_id(session: Session, room_id: int) -> Room:
    room = session.get(Room, room_id)
    if not room:
        raise NotFoundError("Room not found")
    return room


def update_room(session: Session, room_id: int, hotel_id: int, data: RoomUpdate) -> Room:
    room = get_room_by_id(session, room_id)
    if room.hotel_id != hotel_id:
        raise ForbiddenError("Not your room")
    if data.name is not None: room.name = data.name
    if data.description is not None: room.description = data.description
    if data.room_type is not None: room.room_type = data.room_type
    if data.price_per_night is not None: room.price_per_night = data.price_per_night
    if data.capacity is not None: room.capacity = data.capacity
    if data.amenities is not None: room.amenities = json.dumps(data.amenities)
    if data.is_available is not None: room.is_available = data.is_available
    room.updated_at = datetime.utcnow()
    session.add(room)
    session.commit()
    session.refresh(room)
    return room


def delete_room(session: Session, room_id: int, hotel_id: int) -> bool:
    room = get_room_by_id(session, room_id)
    if room.hotel_id != hotel_id:
        raise ForbiddenError("Not your room")
    session.delete(room)
    session.commit()
    return True