from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


class PricingType(str, Enum):
    peak     = "peak"
    off_peak = "off_peak"
    weekend  = "weekend"
    custom   = "custom"


class DynamicPricing(SQLModel, table=True):
    __tablename__ = "dynamic_pricing"
    id:           Optional[int] = Field(default=None, primary_key=True)
    room_id:      int           = Field(foreign_key="rooms.id")
    hotel_id:     int           = Field(foreign_key="hotels.id")
    pricing_type: PricingType   = Field(default=PricingType.custom)
    label:        str           = Field(default="")          # e.g. "Diwali Peak"
    start_date:   date
    end_date:     date
    price_per_night: float                                   # overrides room base price
    created_at:   datetime = Field(default_factory=datetime.utcnow)


class BlackoutDate(SQLModel, table=True):
    __tablename__ = "blackout_dates"
    id:        Optional[int] = Field(default=None, primary_key=True)
    room_id:   int           = Field(foreign_key="rooms.id")
    hotel_id:  int           = Field(foreign_key="hotels.id")
    start_date: date
    end_date:   date
    reason:    str           = Field(default="Maintenance")
    created_at: datetime     = Field(default_factory=datetime.utcnow)


class HotelPhoto(SQLModel, table=True):
    __tablename__ = "hotel_photos"
    id:         Optional[int] = Field(default=None, primary_key=True)
    hotel_id:   int           = Field(foreign_key="hotels.id")
    room_id:    Optional[int] = Field(default=None, foreign_key="rooms.id")  # None = hotel-level photo
    url:        str                                                            # base64 data URL or path
    caption:    str           = Field(default="")
    sort_order: int           = Field(default=0)
    uploaded_at: datetime     = Field(default_factory=datetime.utcnow)
