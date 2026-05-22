from sqlmodel import Session, select
from models.messaging import Message, SenderRole
from datetime import datetime


def send_message(
    session: Session,
    booking_id: int,
    hotel_id: int,
    user_id: int,
    sender_id: int,
    sender_role: SenderRole,
    body: str,
) -> Message:
    msg = Message(
        booking_id=booking_id,
        hotel_id=hotel_id,
        user_id=user_id,
        sender_role=sender_role,
        sender_id=sender_id,
        body=body,
    )
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return msg


def get_messages(session: Session, booking_id: int) -> list[Message]:
    return session.exec(
        select(Message)
        .where(Message.booking_id == booking_id)
        .order_by(Message.created_at)
    ).all()


def mark_read(session: Session, booking_id: int, reader_role: SenderRole) -> int:
    """Mark all messages from the OTHER role as read."""
    other = SenderRole.guest if reader_role == SenderRole.hotel else SenderRole.hotel
    msgs = session.exec(
        select(Message).where(
            Message.booking_id == booking_id,
            Message.sender_role == other,
            Message.is_read == False,
        )
    ).all()
    for m in msgs:
        m.is_read = True
        session.add(m)
    session.commit()
    return len(msgs)


def get_unread_count(session: Session, booking_id: int, reader_role: SenderRole) -> int:
    other = SenderRole.guest if reader_role == SenderRole.hotel else SenderRole.hotel
    msgs = session.exec(
        select(Message).where(
            Message.booking_id == booking_id,
            Message.sender_role == other,
            Message.is_read == False,
        )
    ).all()
    return len(msgs)
