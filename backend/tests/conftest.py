import pytest
import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import User
from app.utils.security import get_password_hash


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Create a test client with database override."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_user(db):
    """Create an admin user for testing."""
    user = User(
        username="admin",
        email="admin@test.com",
        password_hash=get_password_hash("admin123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def admin_token(client, admin_user):
    """Get admin access token."""
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin", "password": "admin123"}
    )
    return response.json()["access_token"]


@pytest.fixture(scope="function")
def admin_headers(admin_token):
    """Get admin authorization headers."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="function")
def test_project(db):
    """Create a test project."""
    from app.models import Project
    project = Project(name="测试项目", slug="test-project", cover="https://example.com/cover.jpg")
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@pytest.fixture(scope="function")
def test_tag(db):
    """Create a test tag."""
    from app.models import Tag
    tag = Tag(name="Python", slug="python")
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag
