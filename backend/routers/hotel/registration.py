from fastapi import APIRouter, Depends, BackgroundTasks
from sqlmodel import Session
from database import get_session
from core.dependencies import require_role, get_current_user
from models.user import UserRole, User
from schemas.hotel import HotelCreate, HotelUpdate
from services.hotel_service import create_hotel, get_hotel_by_owner, update_hotel
from services.email_service import EmailService
from utils.email_templates import hotel_registration_pending
from datetime import datetime

router = APIRouter(prefix="/api/hotel", tags=["hotel"])
guard = Depends(require_role(UserRole.hotel_admin))


@router.post("/register", dependencies=[guard])
def register_hotel(
    data: HotelCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = create_hotel(session, current_user.id, data)
    
    # Send confirmation email to hotel admin about pending approval
    subject, html = hotel_registration_pending(
        current_user.full_name,
        hotel.name,
        datetime.utcnow().strftime("%B %d, %Y at %I:%M %p UTC")
    )
    background_tasks.add_task(
        EmailService.send_email_sync,
        current_user.email,
        subject,
        html
    )
    
    return hotel


@router.get("/my-hotel", dependencies=[guard])
def my_hotel(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    return get_hotel_by_owner(session, current_user.id)


@router.put("/my-hotel", dependencies=[guard])
def update_my_hotel(
    data: HotelUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.hotel_admin)),
):
    hotel = get_hotel_by_owner(session, current_user.id)
    return update_hotel(session, hotel, data, current_user.id)
