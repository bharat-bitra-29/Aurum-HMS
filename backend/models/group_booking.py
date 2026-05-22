from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


class GroupBookingStatus(str, Enum):
    pending   = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"


class GroupBooking(SQLModel, table=True):
    __tablename__ = "group_bookings"
    id:           Optional[int]      = Field(default=None, primary_key=True)
    user_id:      int                = Field(foreign_key="users.id")
    hotel_id:     int                = Field(foreign_key="hotels.id")
    room_type:    str                = Field(default="standard")
    num_rooms:    int                                         # must be >= 5
    check_in:     date
    check_out:    date
    guests_per_room: int             = Field(default=2)
    total_guests: int
    base_amount:  float
    discount_pct: float              = Field(default=10.0)   # 10% group discount
    total_amount: float
    status:       GroupBookingStatus = Field(default=GroupBookingStatus.pending)
    special_requests: str           = Field(default="")
    contact_name:    str            = Field(default="")
    contact_phone:   str            = Field(default="")
    created_at:      datetime       = Field(default_factory=datetime.utcnow)
