import pytest
from fastapi.testclient import TestClient
from .conftest import get_token, auth_headers

HOTEL_PAYLOAD = {
    "name": "Grand Aurum", "description": "A luxury property",
    "address": "Sheikh Zayed Rd", "city": "Dubai", "country": "UAE",
    "phone": "+971000000", "email": "info@aurum.com", "star_rating": 5,
    "amenities": ["Pool", "Spa"],
}

ROOM_PAYLOAD = {
    "name": "Presidential Suite", "description": "Top floor luxury",
    "room_type": "presidential", "price_per_night": 1200,
    "capacity": 2, "amenities": ["Jacuzzi", "Butler Service"],
}


def test_register_hotel(client: TestClient, hotel_admin_user):
    token = get_token(client, "hoteladmin@test.com")
    resp = client.post("/api/hotel/register", headers=auth_headers(token), json=HOTEL_PAYLOAD)
    assert resp.status_code == 200
    assert resp.json()["status"] == "pending"


def test_get_my_hotel(client: TestClient, hotel_admin_user):
    token = get_token(client, "hoteladmin@test.com")
    client.post("/api/hotel/register", headers=auth_headers(token), json=HOTEL_PAYLOAD)
    resp = client.get("/api/hotel/my-hotel", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["name"] == "Grand Aurum"


def test_add_room(client: TestClient, hotel_admin_user, admin_user):
    ha_token = get_token(client, "hoteladmin@test.com")
    client.post("/api/hotel/register", headers=auth_headers(ha_token), json=HOTEL_PAYLOAD)
    # Approve hotel
    admin_token = get_token(client, "admin@test.com")
    hotels = client.get("/api/admin/hotels", headers=auth_headers(admin_token)).json()
    client.post(f"/api/admin/hotels/{hotels[0]['id']}/approve",
                headers=auth_headers(admin_token), json={"approved": True})
    # Add room
    resp = client.post("/api/hotel/rooms", headers=auth_headers(ha_token), json=ROOM_PAYLOAD)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Presidential Suite"


def test_list_rooms(client: TestClient, hotel_admin_user):
    token = get_token(client, "hoteladmin@test.com")
    client.post("/api/hotel/register", headers=auth_headers(token), json=HOTEL_PAYLOAD)
    resp = client.get("/api/hotel/rooms", headers=auth_headers(token))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_hotel_required_for_rooms(client: TestClient, hotel_admin_user):
    token = get_token(client, "hoteladmin@test.com")
    resp = client.get("/api/hotel/rooms", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json() == []


def test_user_cannot_access_hotel_routes(client: TestClient, regular_user):
    token = get_token(client, "user@test.com")
    resp = client.get("/api/hotel/rooms", headers=auth_headers(token))
    assert resp.status_code == 403
