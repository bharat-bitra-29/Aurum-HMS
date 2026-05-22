import os, base64, uuid
from sqlmodel import Session, select
from models.property import DynamicPricing, BlackoutDate, HotelPhoto
from datetime import date
from typing import Optional


# ── Dynamic Pricing ──────────────────────────────────────────────────────────

def set_dynamic_price(session: Session, hotel_id: int, room_id: int, data: dict) -> DynamicPricing:
    dp = DynamicPricing(hotel_id=hotel_id, room_id=room_id, **data)
    session.add(dp)
    session.commit()
    session.refresh(dp)
    return dp


def get_dynamic_prices(session: Session, hotel_id: int) -> list[DynamicPricing]:
    return session.exec(select(DynamicPricing).where(DynamicPricing.hotel_id == hotel_id)).all()


def delete_dynamic_price(session: Session, price_id: int, hotel_id: int) -> bool:
    dp = session.get(DynamicPricing, price_id)
    if not dp or dp.hotel_id != hotel_id:
        return False
    session.delete(dp)
    session.commit()
    return True


def get_price_for_date(session: Session, room_id: int, check_date: date) -> Optional[float]:
    """Returns overridden price if a dynamic pricing rule covers check_date, else None."""
    rules = session.exec(
        select(DynamicPricing).where(
            DynamicPricing.room_id == room_id,
            DynamicPricing.start_date <= check_date,
            DynamicPricing.end_date   >= check_date,
        )
    ).all()
    if not rules:
        return None
    # Most specific rule wins (latest created)
    return sorted(rules, key=lambda r: r.created_at, reverse=True)[0].price_per_night


def get_effective_price(session: Session, room_id: int, check_in: date, check_out: date, base_price: float) -> float:
    """Average effective price per night across the stay, respecting dynamic rules."""
    total = 0.0
    nights = (check_out - check_in).days
    if nights <= 0:
        return base_price
    from datetime import timedelta
    for i in range(nights):
        day = check_in + timedelta(days=i)
        price = get_price_for_date(session, room_id, day)
        total += price if price is not None else base_price
    return total / nights


# ── Blackout Dates ───────────────────────────────────────────────────────────

def add_blackout(session: Session, hotel_id: int, room_id: int, data: dict) -> BlackoutDate:
    bd = BlackoutDate(hotel_id=hotel_id, room_id=room_id, **data)
    session.add(bd)
    session.commit()
    session.refresh(bd)
    return bd


def get_blackouts(session: Session, hotel_id: int) -> list[BlackoutDate]:
    return session.exec(select(BlackoutDate).where(BlackoutDate.hotel_id == hotel_id)).all()


def delete_blackout(session: Session, blackout_id: int, hotel_id: int) -> bool:
    bd = session.get(BlackoutDate, blackout_id)
    if not bd or bd.hotel_id != hotel_id:
        return False
    session.delete(bd)
    session.commit()
    return True


def is_room_blacked_out(session: Session, room_id: int, check_in: date, check_out: date) -> bool:
    bds = session.exec(
        select(BlackoutDate).where(
            BlackoutDate.room_id == room_id,
            BlackoutDate.start_date < check_out,
            BlackoutDate.end_date   > check_in,
        )
    ).first()
    return bds is not None


# ── Photos ───────────────────────────────────────────────────────────────────

UPLOAD_DIR = "uploads"

def save_photo(session: Session, hotel_id: int, room_id: Optional[int], data_url: str, caption: str = "") -> HotelPhoto:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    # Strip data URL prefix and save as file
    if "," in data_url:
        header, encoded = data_url.split(",", 1)
        ext = "jpg" if "jpeg" in header else "png"
    else:
        encoded = data_url
        ext = "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(base64.b64decode(encoded))

    photo = HotelPhoto(
        hotel_id=hotel_id,
        room_id=room_id,
        url=f"/uploads/{filename}",
        caption=caption,
    )
    session.add(photo)
    session.commit()
    session.refresh(photo)
    return photo


def get_photos(session: Session, hotel_id: int, room_id: Optional[int] = None) -> list[HotelPhoto]:
    q = select(HotelPhoto).where(HotelPhoto.hotel_id == hotel_id)
    if room_id is not None:
        q = q.where(HotelPhoto.room_id == room_id)
    return session.exec(q.order_by(HotelPhoto.sort_order)).all()


def delete_photo(session: Session, photo_id: int, hotel_id: int) -> bool:
    photo = session.get(HotelPhoto, photo_id)
    if not photo or photo.hotel_id != hotel_id:
        return False
    # Remove file
    path = photo.url.lstrip("/")
    if os.path.exists(path):
        os.remove(path)
    session.delete(photo)
    session.commit()
    return True
