from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from models.messaging import SenderRole
from services.messaging_service import send_message, get_messages, mark_read
from pydantic import BaseModel

router = APIRouter(prefix="/api/user", tags=["user-messaging"])
guard = Depends(require_role(UserRole.user))


class MessageCreate(BaseModel):
    body: str


@router.get("/bookings/{booking_id}/messages", dependencies=[guard])
def list_messages(booking_id: int,
                  current_user: User = Depends(require_role(UserRole.user)),
                  session: Session = Depends(get_session)):
    mark_read(session, booking_id, SenderRole.guest)
    return get_messages(session, booking_id)


@router.post("/bookings/{booking_id}/messages", dependencies=[guard])
def send_msg(booking_id: int, data: MessageCreate,
             current_user: User = Depends(require_role(UserRole.user)),
             session: Session = Depends(get_session)):
    from models.booking import Booking
    booking = session.get(Booking, booking_id)
    return send_message(
        session,
        booking_id=booking_id,
        hotel_id=booking.hotel_id,
        user_id=current_user.id,
        sender_id=current_user.id,
        sender_role=SenderRole.guest,
        body=data.body,
    )
