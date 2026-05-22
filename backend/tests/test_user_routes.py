import pytest
from fastapi.testclient import TestClient
from .conftest import get_token, auth_headers


def test_search_returns_list(client: TestClient, regular_user):
    token = get_token(client, "user@test.com")
    resp = client.get("/api/user/search", headers=auth_headers(token))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_search_by_location(client: TestClient, regular_user):
    token = get_token(client, "user@test.com")
    resp = client.get("/api/user/search?location=Dubai", headers=auth_headers(token))
    assert resp.status_code == 200


def test_location_suggestions(client: TestClient, regular_user):
    token = get_token(client, "user@test.com")
    resp = client.get("/api/user/search/suggestions?q=Du", headers=auth_headers(token))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_profile(client: TestClient, regular_user):
    token = get_token(client, "user@test.com")
    resp = client.get("/api/user/profile", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["email"] == "user@test.com"


def test_update_profile(client: TestClient, regular_user):
    token = get_token(client, "user@test.com")
    resp = client.put("/api/user/profile", headers=auth_headers(token),
                      json={"full_name": "Updated Name"})
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Updated Name"


def test_my_bookings_empty(client: TestClient, regular_user):
    token = get_token(client, "user@test.com")
    resp = client.get("/api/user/bookings", headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json() == []


def test_search_no_auth(client: TestClient):
    resp = client.get("/api/user/search")
    assert resp.status_code == 403