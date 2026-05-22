from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class SenderRole(str, Enum):
    hotel = "hotel"
    guest = "guest"


class Message(SQLModel, table=True):
    __tablename__ = "messages"
    id:         Optional[int] = Field(default=None, primary_key=True)
    booking_id: int           = Field(foreign_key="bookings.id")
    hotel_id:   int           = Field(foreign_key="hotels.id")
    user_id:    int           = Field(foreign_key="users.id")
    sender_role: SenderRole
    sender_id:  int           # user_id or hotel owner_id
    body:       str
    is_read:    bool          = Field(default=False)
    created_at: datetime      = Field(default_factory=datetime.utcnow)
