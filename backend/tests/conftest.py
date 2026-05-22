import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from main import app
from database import get_session
from models.user import User, UserRole
from core.security import hash_password


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def override_get_session():
        yield session

    app.dependency_overrides[get_session] = override_get_session
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_user(session: Session) -> User:
    user = User(
        email="admin@test.com",
        full_name="Test Admin",
        hashed_password=hash_password("password123"),
        role=UserRole.platform_admin,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def hotel_admin_user(session: Session) -> User:
    user = User(
        email="hoteladmin@test.com",
        full_name="Hotel Admin",
        hashed_password=hash_password("password123"),
        role=UserRole.hotel_admin,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def regular_user(session: Session) -> User:
    user = User(
        email="user@test.com",
        full_name="Test User",
        hashed_password=hash_password("password123"),
        role=UserRole.user,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def get_token(client: TestClient, email: str, password: str = "password123") -> str:
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}