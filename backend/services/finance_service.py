from sqlmodel import Session, select
from models.finance import CommissionTier, Payout, PayoutStatus, Refund, RefundStatus, HotelSuspension
from models.booking import Booking, BookingStatus
from models.hotel import Hotel
from models.commission import Commission
from core.exceptions import NotFoundError, BadRequestError, ConflictError
from datetime import datetime, date


# ── Commission Tiers ─────────────────────────────────────────────────────────

def set_commission_tier(session: Session, hotel_id: int, rate: float, label: str, admin_id: int) -> CommissionTier:
    existing = session.exec(select(CommissionTier).where(CommissionTier.hotel_id == hotel_id)).first()
    if existing:
        existing.rate = rate
        existing.label = label
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    tier = CommissionTier(hotel_id=hotel_id, rate=rate, label=label, set_by=admin_id)
    session.add(tier)
    session.commit()
    session.refresh(tier)
    # Also update hotel commission_rate
    hotel = session.get(Hotel, hotel_id)
    if hotel:
        hotel.commission_rate = rate
        session.add(hotel)
        session.commit()
    return tier


def get_commission_tier(session: Session, hotel_id: int) -> CommissionTier | None:
    return session.exec(select(CommissionTier).where(CommissionTier.hotel_id == hotel_id)).first()


def get_all_tiers(session: Session) -> list[CommissionTier]:
    return session.exec(select(CommissionTier)).all()


# ── Payouts ──────────────────────────────────────────────────────────────────

def create_payout(session: Session, hotel_id: int, period_start: date, period_end: date) -> Payout:
    # Gather confirmed bookings in period
    bookings = session.exec(
        select(Booking).where(
            Booking.hotel_id == hotel_id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.completed]),
            Booking.check_out >= period_start,
            Booking.check_out <= period_end,
        )
    ).all()
    if not bookings:
        raise BadRequestError("No bookings found in this period")

    gross = sum(b.total_amount for b in bookings)
    hotel = session.get(Hotel, hotel_id)
    rate  = hotel.commission_rate if hotel else 0.10
    commission = gross * rate
    net = gross - commission

    payout = Payout(
        hotel_id=hotel_id,
        period_start=period_start,
        period_end=period_end,
        gross_amount=gross,
        commission=commission,
        net_amount=net,
    )
    session.add(payout)
    session.commit()
    session.refresh(payout)
    return payout


def get_payouts(session: Session, hotel_id: int | None = None) -> list[Payout]:
    q = select(Payout)
    if hotel_id:
        q = q.where(Payout.hotel_id == hotel_id)
    return session.exec(q).all()


def process_payout(session: Session, payout_id: int) -> Payout:
    payout = session.get(Payout, payout_id)
    if not payout:
        raise NotFoundError("Payout not found")
    payout.status = PayoutStatus.processed
    payout.processed_at = datetime.utcnow()
    session.add(payout)
    session.commit()
    session.refresh(payout)
    return payout


# ── Refunds ──────────────────────────────────────────────────────────────────

def request_refund(session: Session, booking_id: int, user_id: int, amount: float, reason: str) -> Refund:
    existing = session.exec(
        select(Refund).where(
            Refund.booking_id == booking_id,
            Refund.status.in_([RefundStatus.requested, RefundStatus.approved]),
        )
    ).first()
    if existing:
        raise ConflictError("A refund request already exists for this booking")
    refund = Refund(booking_id=booking_id, user_id=user_id, amount=amount, reason=reason)
    session.add(refund)
    session.commit()
    session.refresh(refund)
    return refund


def get_all_refunds(session: Session) -> list[Refund]:
    return session.exec(select(Refund)).all()


def process_refund(session: Session, refund_id: int, approved: bool, admin_note: str = "") -> Refund:
    refund = session.get(Refund, refund_id)
    if not refund:
        raise NotFoundError("Refund not found")
    refund.status     = RefundStatus.approved if approved else RefundStatus.rejected
    refund.admin_note = admin_note
    refund.processed_at = datetime.utcnow()
    session.add(refund)
    session.commit()
    session.refresh(refund)
    return refund


# ── Suspension ───────────────────────────────────────────────────────────────

def suspend_hotel(session: Session, hotel_id: int, admin_id: int, reason: str) -> HotelSuspension:
    hotel = session.get(Hotel, hotel_id)
    if not hotel:
        raise NotFoundError("Hotel not found")
    hotel.is_suspended = True
    session.add(hotel)
    susp = HotelSuspension(hotel_id=hotel_id, suspended_by=admin_id, reason=reason)
    session.add(susp)
    session.commit()
    session.refresh(susp)
    return susp


def reinstate_hotel(session: Session, hotel_id: int) -> Hotel:
    hotel = session.get(Hotel, hotel_id)
    if not hotel:
        raise NotFoundError("Hotel not found")
    hotel.is_suspended = False
    session.add(hotel)
    # Mark active suspension as resolved
    susp = session.exec(
        select(HotelSuspension).where(
            HotelSuspension.hotel_id == hotel_id,
            HotelSuspension.is_active == True,
        )
    ).first()
    if susp:
        susp.is_active = False
        susp.reinstated_at = datetime.utcnow()
        session.add(susp)
    session.commit()
    return hotel


def get_suspension_history(session: Session, hotel_id: int) -> list[HotelSuspension]:
    return session.exec(select(HotelSuspension).where(HotelSuspension.hotel_id == hotel_id)).all()
