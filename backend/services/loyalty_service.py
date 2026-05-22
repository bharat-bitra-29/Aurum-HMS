from sqlmodel import Session, select
from models.loyality import LoyaltyAccount, LoyaltyTransaction, LoyaltyTxnType, POINTS_PER_DOLLAR, POINTS_VALUE_CENTS
from models.booking import Booking
from datetime import datetime


def get_or_create_account(session: Session, user_id: int) -> LoyaltyAccount:
    acc = session.exec(select(LoyaltyAccount).where(LoyaltyAccount.user_id == user_id)).first()
    if not acc:
        acc = LoyaltyAccount(user_id=user_id, points=0, lifetime_earned=0)
        session.add(acc)
        session.commit()
        session.refresh(acc)
    return acc


def earn_points(session: Session, user_id: int, booking: Booking) -> LoyaltyAccount:
    acc = get_or_create_account(session, user_id)
    earned = int(booking.total_amount * POINTS_PER_DOLLAR)
    acc.points += earned
    acc.lifetime_earned += earned
    acc.updated_at = datetime.utcnow()
    session.add(acc)
    txn = LoyaltyTransaction(
        user_id=user_id,
        booking_id=booking.id,
        txn_type=LoyaltyTxnType.earn,
        points=earned,
        description=f"Earned for booking #{booking.id}",
    )
    session.add(txn)
    session.commit()
    session.refresh(acc)
    return acc


def redeem_points(session: Session, user_id: int, points_to_redeem: int) -> float:
    """Returns dollar discount amount. Raises if insufficient points."""
    acc = get_or_create_account(session, user_id)
    if acc.points < points_to_redeem:
        from core.exceptions import BadRequestError
        raise BadRequestError(f"Insufficient points. Available: {acc.points}")
    discount = (points_to_redeem * POINTS_VALUE_CENTS) / 100
    acc.points -= points_to_redeem
    acc.updated_at = datetime.utcnow()
    session.add(acc)
    txn = LoyaltyTransaction(
        user_id=user_id,
        txn_type=LoyaltyTxnType.redeem,
        points=-points_to_redeem,
        description=f"Redeemed for ${discount:.2f} discount",
    )
    session.add(txn)
    session.commit()
    return discount


def get_transactions(session: Session, user_id: int) -> list[LoyaltyTransaction]:
    return session.exec(
        select(LoyaltyTransaction)
        .where(LoyaltyTransaction.user_id == user_id)
        .order_by(LoyaltyTransaction.created_at.desc())
    ).all()
