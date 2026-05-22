from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from services.group_booking_service import create_group_booking, get_group_bookings_by_user
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter(prefix="/api/user", tags=["user-group"])
guard = Depends(require_role(UserRole.user))


class GroupBookingCreate(BaseModel):
    hotel_id:     int
    room_type:    str = "standard"
    num_rooms:    int
    check_in:     date
    check_out:    date
    guests_per_room: int = 2
    special_requests: str = ""
    contact_name: str = ""
    contact_phone: str = ""


@router.post("/group-bookings", dependencies=[guard])
def create_group(data: GroupBookingCreate,
                 current_user: User = Depends(require_role(UserRole.user)),
                 session: Session = Depends(get_session)):
    return create_group_booking(session, current_user.id, data.model_dump())


@router.get("/group-bookings", dependencies=[guard])
def my_group_bookings(current_user: User = Depends(require_role(UserRole.user)),
                      session: Session = Depends(get_session)):
    return get_group_bookings_by_user(session, current_user.id)
