from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.hotel import HotelStatus


class HotelCreate(BaseModel):
    name: str
    description: str = ""
    address: str
    city: str
    country: str
    phone: str = ""
    email: str = ""
    star_rating: int = 3
    amenities: List[str] = []
    latitude: float = 0.0
    longitude: float = 0.0


class HotelRead(BaseModel):
    id: int
    owner_id: int
    name: str
    description: str
    address: str
    city: str
    country: str
    phone: str
    email: str
    star_rating: int
    status: HotelStatus
    rejection_reason: Optional[str]
    amenities: str
    latitude: float
    longitude: float
    created_at: datetime

    class Config:
        from_attributes = True


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    star_rating: Optional[int] = None
    amenities: Optional[List[str]] = None


class HotelApprove(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = None
