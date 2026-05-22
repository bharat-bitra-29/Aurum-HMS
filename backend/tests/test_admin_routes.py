import pytest
from fastapi.testclient import TestClient
from .conftest import get_token, auth_headers


def test_dashboard_requires_auth(client: TestClient):
    resp = client.get("/api/admin/dashboard")
    assert resp.status_code == 403


def test_dashboard_forbidden_for_user(client: TestClient, regular_user):
    token = get_token(client, "user@test.com")
    resp = client.get("/api/admin/dashboard", headers=auth_headers(token))
    assert resp.status_code == 403


def test_dashboard_success(client: TestClient, admin_user):
    token = get_token(client, "admin@test.com")
    resp = client.get("/api/admin/dashboard", headers=auth_headers(token))
    assert resp.status_code == 200
    data = resp.json()
    assert "total_hotels" in data
    assert "total_users" in data
    assert "total_revenue" in data


def test_list_hotels(client: TestClient, admin_user):
    token = get_token(client, "admin@test.com")
    resp = client.get("/api/admin/hotels", headers=auth_headers(token))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_list_users(client: TestClient, admin_user, regular_user):
    token = get_token(client, "admin@test.com")
    resp = client.get("/api/admin/users", headers=auth_headers(token))
    assert resp.status_code == 200
    emails = [u["email"] for u in resp.json()]
    assert "user@test.com" in emails


def test_toggle_block_user(client: TestClient, admin_user, regular_user):
    token = get_token(client, "admin@test.com")
    resp = client.post(f"/api/admin/users/{regular_user.id}/toggle-block", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["is_blocked"] is True
    # toggle back
    resp2 = client.post(f"/api/admin/users/{regular_user.id}/toggle-block", headers=auth_headers(token))
    assert resp2.json()["is_blocked"] is False


def test_approve_hotel(client: TestClient, admin_user, hotel_admin_user):
    # Hotel admin registers a hotel first
    ha_token = get_token(client, "hoteladmin@test.com")
    client.post("/api/hotel/register", headers=auth_headers(ha_token), json={
        "name": "Test Hotel", "address": "123 Main St", "city": "Dubai",
        "country": "UAE", "star_rating": 4,
    })
    # Admin approves
    admin_token = get_token(client, "admin@test.com")
    hotels = client.get("/api/admin/hotels", headers=auth_headers(admin_token)).json()
    assert len(hotels) > 0
    hid = hotels[0]["id"]
    resp = client.post(f"/api/admin/hotels/{hid}/approve", headers=auth_headers(admin_token),
                       json={"approved": True})
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"