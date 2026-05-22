from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class Booking(SQLModel, table=True):
    __tablename__ = "bookings"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    room_id: int = Field(foreign_key="rooms.id")
    hotel_id: int = Field(foreign_key="hotels.id")
    check_in: date
    check_out: date
    guests: int = Field(default=1)
    total_amount: float
    status: BookingStatus = Field(default=BookingStatus.pending)
    special_requests: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
