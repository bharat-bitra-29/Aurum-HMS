from fastapi import APIRouter, Depends, BackgroundTasks
from sqlmodel import Session, select
from database import get_session
from core.dependencies import require_role
from models.user import UserRole, User
from schemas.hotel import HotelApprove
from services.hotel_service import get_all_hotels, approve_or_reject_hotel, get_hotel_by_id
from services.email_service import EmailService
from utils.email_templates import hotel_approved, hotel_rejected

router = APIRouter(prefix="/api/admin", tags=["admin"])
guard = Depends(require_role(UserRole.platform_admin))


@router.get("/hotels", dependencies=[guard])
def list_all_hotels(session: Session = Depends(get_session)):
    return get_all_hotels(session)


@router.get("/hotels/{hotel_id}", dependencies=[guard])
def hotel_detail(hotel_id: int, session: Session = Depends(get_session)):
    return get_hotel_by_id(session, hotel_id)


@router.post("/hotels/{hotel_id}/approve", dependencies=[guard])
def approve_hotel(
    hotel_id: int,
    data: HotelApprove,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    hotel = approve_or_reject_hotel(session, hotel_id, data)
    
    # Find hotel owner and send email
    owner = session.get(User, hotel.owner_id)
    if owner and owner.email:
        if data.approved:
            subject, html = hotel_approved(owner.full_name, hotel.name)
            background_tasks.add_task(
                EmailService.send_email_sync,
                owner.email,
                subject,
                html
            )
        else:
            subject, html = hotel_rejected(
                owner.full_name,
                hotel.name,
                data.rejection_reason or ""
            )
            background_tasks.add_task(
                EmailService.send_email_sync,
                owner.email,
                subject,
                html
            )
    return hotel
