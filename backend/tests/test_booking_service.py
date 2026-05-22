import pytest
from datetime import date, timedelta
from sqlmodel import Session
from fastapi.testclient import TestClient
from .conftest import get_token, auth_headers

TODAY = date.today()
CHECKIN  = (TODAY + timedelta(days=5)).isoformat()
CHECKOUT = (TODAY + timedelta(days=8)).isoformat()

HOTEL_PAYLOAD = {
    "name": "Booking Test Hotel", "address": "Test St",
    "city": "TestCity", "country": "TestLand", "star_rating": 3,
}

ROOM_PAYLOAD = {
    "name": "Test Room", "room_type": "standard",
    "price_per_night": 200, "capacity": 2, "amenities": [],
}


def _setup_approved_hotel_with_room(client, hotel_admin_user, admin_user):
    """Helper: register hotel, approve it, add a room, return (hotel_id, room_id, ha_token)."""
    ha_token = get_token(client, "hoteladmin@test.com")
    hotel = client.post("/api/hotel/register", headers=auth_headers(ha_token),
                        json=HOTEL_PAYLOAD).json()
    admin_token = get_token(client, "admin@test.com")
    client.post(f"/api/admin/hotels/{hotel['id']}/approve",
                headers=auth_headers(admin_token), json={"approved": True})
    room = client.post("/api/hotel/rooms", headers=auth_headers(ha_token),
                       json=ROOM_PAYLOAD).json()
    return hotel["id"], room["id"], ha_token


def test_create_booking(client: TestClient, regular_user, hotel_admin_user, admin_user):
    hotel_id, room_id, _ = _setup_approved_hotel_with_room(client, hotel_admin_user, admin_user)
    token = get_token(client, "user@test.com")
    resp = client.post("/api/user/bookings", headers=auth_headers(token), json={
        "room_id": room_id, "hotel_id": hotel_id,
        "check_in": CHECKIN, "check_out": CHECKOUT, "guests": 1,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "pending"
    assert data["total_amount"] == 200 * 3   # 3 nights


def test_booking_calculates_nights_correctly(client: TestClient, regular_user, hotel_admin_user, admin_user):
    hotel_id, room_id, _ = _setup_approved_hotel_with_room(client, hotel_admin_user, admin_user)
    token = get_token(client, "user@test.com")
    checkin  = (TODAY + timedelta(days=10)).isoformat()
    checkout = (TODAY + timedelta(days=12)).isoformat()
    resp = client.post("/api/user/bookings", headers=auth_headers(token), json={
        "room_id": room_id, "hotel_id": hotel_id,
        "check_in": checkin, "check_out": checkout, "guests": 1,
    })
    assert resp.json()["total_amount"] == 200 * 2


def test_double_booking_prevented(client: TestClient, regular_user, hotel_admin_user, admin_user):
    hotel_id, room_id, _ = _setup_approved_hotel_with_room(client, hotel_admin_user, admin_user)
    token = get_token(client, "user@test.com")
    payload = {"room_id": room_id, "hotel_id": hotel_id,
               "check_in": CHECKIN, "check_out": CHECKOUT, "guests": 1}
    client.post("/api/user/bookings", headers=auth_headers(token), json=payload)
    resp = client.post("/api/user/bookings", headers=auth_headers(token), json=payload)
    assert resp.status_code == 400


def test_past_checkin_rejected(client: TestClient, regular_user, hotel_admin_user, admin_user):
    hotel_id, room_id, _ = _setup_approved_hotel_with_room(client, hotel_admin_user, admin_user)
    token = get_token(client, "user@test.com")
    resp = client.post("/api/user/bookings", headers=auth_headers(token), json={
        "room_id": room_id, "hotel_id": hotel_id,
        "check_in": "2020-01-01", "check_out": "2020-01-05", "guests": 1,
    })
    assert resp.status_code == 400


def test_cancel_booking(client: TestClient, regular_user, hotel_admin_user, admin_user):
    hotel_id, room_id, _ = _setup_approved_hotel_with_room(client, hotel_admin_user, admin_user)
    token = get_token(client, "user@test.com")
    booking = client.post("/api/user/bookings", headers=auth_headers(token), json={
        "room_id": room_id, "hotel_id": hotel_id,
        "check_in": CHECKIN, "check_out": CHECKOUT, "guests": 1,
    }).json()
    resp = client.post(f"/api/user/bookings/{booking['id']}/cancel", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["status"] == "cancelled"


def test_hotel_confirm_triggers_commission(client: TestClient, regular_user, hotel_admin_user, admin_user):
    hotel_id, room_id, ha_token = _setup_approved_hotel_with_room(client, hotel_admin_user, admin_user)
    user_token = get_token(client, "user@test.com")
    booking = client.post("/api/user/bookings", headers=auth_headers(user_token), json={
        "room_id": room_id, "hotel_id": hotel_id,
        "check_in": CHECKIN, "check_out": CHECKOUT, "guests": 1,
    }).json()
    # Hotel confirms
    client.put(f"/api/hotel/bookings/{booking['id']}/status",
               headers=auth_headers(ha_token), json={"status": "confirmed"})
    # Platform admin sees commission
    admin_token = get_token(client, "admin@test.com")
    commission = client.get("/api/admin/commission", headers=auth_headers(admin_token)).json()
    assert commission["count"] == 1
    assert commission["total"] == booking["total_amount"] * 0.10
