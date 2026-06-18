import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.dependencies.db import get_db
from app.main import app
from app.dependencies.auth import get_current_user
from app.models.user import User

# SQLite in-memory test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def mock_user():
    return User(id="test-user-id", email="user@example.com", name="Test User")

@pytest.fixture(scope="module")
def client(db_session, mock_user):
    # Override get_db dependency
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Override authentication dependency
    def override_get_current_user():
        return mock_user

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    with TestClient(app) as c:
        yield c
        
    app.dependency_overrides.clear()

def test_read_expenses_date_filtering(client, db_session, mock_user):
    # Seed database with test expenses
    from app.models.expense import Expense
    from datetime import date
    
    e1 = Expense(id="e1", title="Expense 1", amount=100.0, category="Food", expense_date=date(2026, 6, 1), user_id=mock_user.id)
    e2 = Expense(id="e2", title="Expense 2", amount=200.0, category="Travel", expense_date=date(2026, 6, 5), user_id=mock_user.id)
    e3 = Expense(id="e3", title="Expense 3", amount=300.0, category="Bills", expense_date=date(2026, 6, 10), user_id=mock_user.id)
    
    db_session.add_all([e1, e2, e3])
    db_session.commit()

    # Test 1: Query with no date filter
    response = client.get("/expenses")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

    # Test 2: Query with start_date filter
    response = client.get("/expenses?start_date=2026-06-05")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(d["id"] in ["e2", "e3"] for d in data)

    # Test 3: Query with end_date filter
    response = client.get("/expenses?end_date=2026-06-05")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(d["id"] in ["e1", "e2"] for d in data)

    # Test 4: Query with date range filter
    response = client.get("/expenses?start_date=2026-06-02&end_date=2026-06-08")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "e2"

    # Test 5: Query with invalid date range filter (start_date > end_date)
    response = client.get("/expenses?start_date=2026-06-10&end_date=2026-06-05")
    assert response.status_code == 422
    assert "detail" in response.json()
