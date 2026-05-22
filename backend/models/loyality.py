from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class LoyaltyTxnType(str, Enum):
    earn   = "earn"
    redeem = "redeem"
    expire = "expire"


class LoyaltyAccount(SQLModel, table=True):
    __tablename__ = "loyalty_accounts"
    id:         Optional[int] = Field(default=None, primary_key=True)
    user_id:    int           = Field(foreign_key="users.id", unique=True)
    points:     int           = Field(default=0)
    lifetime_earned: int      = Field(default=0)
    updated_at: datetime      = Field(default_factory=datetime.utcnow)


class LoyaltyTransaction(SQLModel, table=True):
    __tablename__ = "loyalty_transactions"
    id:         Optional[int]    = Field(default=None, primary_key=True)
    user_id:    int              = Field(foreign_key="users.id")
    booking_id: Optional[int]   = Field(default=None, foreign_key="bookings.id")
    txn_type:   LoyaltyTxnType
    points:     int
    description: str            = Field(default="")
    created_at: datetime        = Field(default_factory=datetime.utcnow)

# 1 point per $1 spent; 100 points = $1 discount
POINTS_PER_DOLLAR   = 1
POINTS_VALUE_CENTS  = 1   # 1 point = $0.01
