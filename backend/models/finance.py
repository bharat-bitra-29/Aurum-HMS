from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum


# ── Commission tier ──────────────────────────────────────────────────────────
class CommissionTier(SQLModel, table=True):
    __tablename__ = "commission_tiers"
    id:       Optional[int] = Field(default=None, primary_key=True)
    hotel_id: int           = Field(foreign_key="hotels.id", unique=True)
    rate:     float         = Field(default=0.10)     # 0.08 = 8%
    label:    str           = Field(default="Standard")  # Standard / Premium / Partner
    set_by:   int           = Field(foreign_key="users.id")
    updated_at: datetime    = Field(default_factory=datetime.utcnow)


# ── Payout ───────────────────────────────────────────────────────────────────
class PayoutStatus(str, Enum):
    pending   = "pending"
    processed = "processed"
    failed    = "failed"


class Payout(SQLModel, table=True):
    __tablename__ = "payouts"
    id:           Optional[int] = Field(default=None, primary_key=True)
    hotel_id:     int           = Field(foreign_key="hotels.id")
    period_start: date
    period_end:   date
    gross_amount: float
    commission:   float
    net_amount:   float
    status:       PayoutStatus  = Field(default=PayoutStatus.pending)
    notes:        str           = Field(default="")
    processed_at: Optional[datetime] = None
    created_at:   datetime      = Field(default_factory=datetime.utcnow)


# ── Refund ───────────────────────────────────────────────────────────────────
class RefundStatus(str, Enum):
    requested = "requested"
    approved  = "approved"
    rejected  = "rejected"
    processed = "processed"


class Refund(SQLModel, table=True):
    __tablename__ = "refunds"
    id:           Optional[int] = Field(default=None, primary_key=True)
    booking_id:   int           = Field(foreign_key="bookings.id")
    user_id:      int           = Field(foreign_key="users.id")
    amount:       float
    reason:       str
    status:       RefundStatus  = Field(default=RefundStatus.requested)
    admin_note:   str           = Field(default="")
    processed_at: Optional[datetime] = None
    created_at:   datetime      = Field(default_factory=datetime.utcnow)


# ── Hotel suspension ──────────────────────────────────────────────────────────
class HotelSuspension(SQLModel, table=True):
    __tablename__ = "hotel_suspensions"
    id:           Optional[int]  = Field(default=None, primary_key=True)
    hotel_id:     int            = Field(foreign_key="hotels.id")
    suspended_by: int            = Field(foreign_key="users.id")
    reason:       str
    is_active:    bool           = Field(default=True)
    reinstated_at: Optional[datetime] = None
    created_at:   datetime       = Field(default_factory=datetime.utcnow)
