from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Room(SQLModel, table=True):
    __tablename__ = "rooms"
    id: Optional[int] = Field(default=None, primary_key=True)
    hotel_id: int = Field(foreign_key="hotels.id")
    name: str
    description: str = Field(default="")
    room_type: str = Field(default="standard")  # standard, deluxe, suite, presidential
    price_per_night: float
    capacity: int = Field(default=2)
    amenities: str = Field(default="[]")   # JSON string
    images: str = Field(default="[]")      # JSON string
    is_available: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
