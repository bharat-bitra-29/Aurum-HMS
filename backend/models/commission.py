from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Commission(SQLModel, table=True):
    __tablename__ = "commissions"
    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int = Field(foreign_key="bookings.id", unique=True)
    hotel_id: int = Field(foreign_key="hotels.id")
    booking_amount: float
    platform_rate: float
    amount: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
