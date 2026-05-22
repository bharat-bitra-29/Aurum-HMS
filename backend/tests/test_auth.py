import pytest
from fastapi.testclient import TestClient


def test_register_user(client: TestClient):
    resp = client.post("/api/auth/register", json={
        "email": "newuser@test.com",
        "full_name": "New User",
        "password": "password123",
        "role": "user",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["role"] == "user"
    assert "access_token" in data


def test_register_hotel_admin(client: TestClient):
    resp = client.post("/api/auth/register", json={
        "email": "manager@test.com",
        "full_name": "Hotel Manager",
        "password": "password123",
        "role": "hotel_admin",
    })
    assert resp.status_code == 200
    assert resp.json()["role"] == "hotel_admin"


def test_register_duplicate_email(client: TestClient):
    payload = {"email": "dup@test.com", "full_name": "A", "password": "pass123", "role": "user"}
    client.post("/api/auth/register", json=payload)
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409


def test_login_success(client: TestClient, regular_user):
    resp = client.post("/api/auth/login", json={"email": "user@test.com", "password": "password123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client: TestClient, regular_user):
    resp = client.post("/api/auth/login", json={"email": "user@test.com", "password": "wrong"})
    assert resp.status_code == 400


def test_login_unknown_email(client: TestClient):
    resp = client.post("/api/auth/login", json={"email": "nobody@test.com", "password": "pass"})
    assert resp.status_code == 400
