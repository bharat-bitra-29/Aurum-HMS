from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from schemas.room import RoomCreate, RoomUpdate
from services.hotel_service import get_hotel_by_owner
from services.room_service import create_room, get_rooms_by_hotel, update_room, delete_room

router = APIRouter(prefix="/api/hotel", tags=["hotel"])
guard = Depends(require_role(UserRole.hotel_admin))


@router.get("/rooms", dependencies=[guard])
def list_rooms(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    if not hotel:
        return []
    return get_rooms_by_hotel(session, hotel.id)


@router.post("/rooms", dependencies=[guard])
def add_room(
    data: RoomCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    return create_room(session, hotel.id, data)


@router.put("/rooms/{room_id}", dependencies=[guard])
def edit_room(
    room_id: int,
    data: RoomUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    return update_room(session, room_id, hotel.id, data)


@router.delete("/rooms/{room_id}", dependencies=[guard])
def remove_room(
    room_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    delete_room(session, room_id, hotel.id)
    return {"message": "Room deleted"}
