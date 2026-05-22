from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RoomCreate(BaseModel):
    name: str
    description: str = ""
    room_type: str = "standard"
    price_per_night: float
    capacity: int = 2
    amenities: List[str] = []


class RoomRead(BaseModel):
    id: int
    hotel_id: int
    name: str
    description: str
    room_type: str
    price_per_night: float
    capacity: int
    amenities: str
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    room_type: Optional[str] = None
    price_per_night: Optional[float] = None
    capacity: Optional[int] = None
    amenities: Optional[List[str]] = None
    is_available: Optional[bool] = None
