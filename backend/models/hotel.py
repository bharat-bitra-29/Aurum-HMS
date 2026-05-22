from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class HotelStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Hotel(SQLModel, table=True):
    __tablename__ = "hotels"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    name: str
    description: str = Field(default="")
    address: str
    city: str
    country: str
    phone: str = Field(default="")
    email: str = Field(default="")
    star_rating: int = Field(default=3, ge=1, le=5)
    status: HotelStatus = Field(default=HotelStatus.pending)
    rejection_reason: Optional[str] = None
    amenities: str = Field(default="[]")  # JSON string
    images: str = Field(default="[]")     # JSON string
    latitude: float = Field(default=0.0)
    longitude: float = Field(default=0.0)
    is_suspended: bool = Field(default=False)
    commission_rate: float = Field(default=0.10)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Coordinates for map search (added as new columns)
# SQLite will add these on first run via create_all