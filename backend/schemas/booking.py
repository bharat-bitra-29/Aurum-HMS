from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from models.booking import BookingStatus


class BookingCreate(BaseModel):
    room_id: int
    hotel_id: int
    check_in: date
    check_out: date
    guests: int = 1
    special_requests: str = ""


class BookingRead(BaseModel):
    id: int
    user_id: int
    room_id: int
    hotel_id: int
    check_in: date
    check_out: date
    guests: int
    total_amount: float
    status: BookingStatus
    special_requests: str
    created_at: datetime

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    status: BookingStatus
