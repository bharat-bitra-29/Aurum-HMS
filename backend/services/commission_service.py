from sqlmodel import Session, select
from models.commission import Commission
from models.booking import Booking, BookingStatus
from config import settings


def create_commission(session: Session, booking: Booking) -> Commission:
    existing = session.exec(select(Commission).where(Commission.booking_id == booking.id)).first()
    if existing:
        return existing
    commission = Commission(
        booking_id=booking.id,
        hotel_id=booking.hotel_id,
        booking_amount=booking.total_amount,
        platform_rate=settings.COMMISSION_RATE,
        amount=booking.total_amount * settings.COMMISSION_RATE,
    )
    session.add(commission)
    session.commit()
    session.refresh(commission)
    return commission


def get_all_commissions(session: Session) -> list[Commission]:
    return session.exec(select(Commission)).all()


def get_commissions_by_hotel(session: Session, hotel_id: int) -> list[Commission]:
    return session.exec(select(Commission).where(Commission.hotel_id == hotel_id)).all()


def get_platform_total(session: Session) -> float:
    commissions = get_all_commissions(session)
    return sum(c.amount for c in commissions)


def get_hotel_net_revenue(session: Session, hotel_id: int, bookings: list[Booking]) -> float:
    confirmed = [b for b in bookings if b.status in [BookingStatus.confirmed, BookingStatus.completed]]
    total = sum(b.total_amount for b in confirmed)
    commission_rate = settings.COMMISSION_RATE
    return total * (1 - commission_rate)
