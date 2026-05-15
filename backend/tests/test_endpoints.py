from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(scope="function")
def mock_db_session():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    db.query.return_value.filter.return_value.all.return_value = []
    return db


@pytest.fixture(scope="function")
def client_mock(mock_db_session):
    def override_get_db():
        try:
            yield mock_db_session
        finally:
            pass

    with patch('backend.main.engine'):
        with patch('backend.models.SessionLocal', return_value=mock_db_session):
            from backend.main import app
            from backend.models import get_db

            app.dependency_overrides[get_db] = override_get_db

            with TestClient(app) as c:
                yield c

            app.dependency_overrides.clear()


class TestMenuEndpoints:
    def test_get_menu_empty(self, client_mock: TestClient):
        response = client_mock.get("/api/menu")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_menu_with_items(self, client_mock: TestClient):
        response = client_mock.get("/api/menu")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_create_menu_item_unauthorized(self, client_mock: TestClient):
        payload = {
            "name": "New Item",
            "description": "New Description",
            "price": 200.0,
            "category": "New"
        }
        response = client_mock.post("/api/menu", json=payload)
        assert response.status_code == 401

    def test_menu_filter_by_category(self, client_mock: TestClient):
        response = client_mock.get("/api/menu?category=Pizza")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_menu_search(self, client_mock: TestClient):
        response = client_mock.get("/api/menu?search=cheese")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestCategoryEndpoints:
    def test_get_categories_empty(self, client_mock: TestClient):
        response = client_mock.get("/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_create_category_unauthorized(self, client_mock: TestClient):
        payload = {"name": "New Category", "description": "Test"}
        response = client_mock.post("/api/categories", json=payload)
        assert response.status_code == 401


class TestAuthEndpoints:
    def test_register_user(self, client_mock: TestClient, mock_db_session):
        import uuid
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"

        mock_db_session.query.return_value.filter.return_value.first.return_value = None

        payload = {
            "username": unique_username,
            "password": "securepass123",
            "role": "user"
        }
        response = client_mock.post("/api/auth/register", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == unique_username

    def test_register_duplicate_user(
            self,
            client_mock: TestClient,
            mock_db_session):
        import uuid
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"

        mock_user = MagicMock()
        mock_user.username = unique_username

        def query_side_effect(model):
            filter_mock = MagicMock()
            if model.__name__ == 'UserModel':
                filter_mock.first.return_value = mock_user
            return filter_mock

        mock_db_session.query.side_effect = query_side_effect

        payload = {
            "username": unique_username,
            "password": "securepass123",
            "role": "user"
        }
        response = client_mock.post("/api/auth/register", json=payload)
        assert response.status_code == 400

    def test_login_success(self, client_mock: TestClient, mock_db_session):
        import uuid
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"

        from backend.auth import get_password_hash
        mock_user = MagicMock()
        mock_user.username = unique_username
        mock_user.hashed_password = get_password_hash("testpass")
        mock_user.role = "user"

        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_user

        payload = {"username": unique_username, "password": "testpass"}
        response = client_mock.post("/api/auth/login", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(
            self,
            client_mock: TestClient,
            mock_db_session):
        import uuid
        unique_username = f"testuser_{uuid.uuid4().hex[:8]}"

        from backend.auth import get_password_hash
        mock_user = MagicMock()
        mock_user.username = unique_username
        mock_user.hashed_password = get_password_hash("testpass")

        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_user

        payload = {"username": unique_username, "password": "wrongpass"}
        response = client_mock.post("/api/auth/login", json=payload)
        assert response.status_code == 401

    def test_login_nonexistent_user(
            self,
            client_mock: TestClient,
            mock_db_session):
        mock_db_session.query.return_value.filter.return_value.first.return_value = None

        payload = {"username": "nouser", "password": "anypass"}
        response = client_mock.post("/api/auth/login", json=payload)
        assert response.status_code == 401


class TestOrderEndpoints:
    def test_create_order_invalid_phone(self, client_mock: TestClient):
        payload = {
            "customer_name": "John Doe",
            "phone": "123",
            "address": "123 Main St",
            "items": [{"menu_item_id": 1, "quantity": 1}]
        }
        response = client_mock.post("/api/orders", json=payload)
        assert response.status_code == 422

    def test_get_orders(self, client_mock: TestClient):
        response = client_mock.get("/api/orders")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
