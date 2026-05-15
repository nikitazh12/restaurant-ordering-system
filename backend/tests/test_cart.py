from fastapi.testclient import TestClient
from unittest.mock import MagicMock


class TestCartEndpoints:
    def test_get_cart_unauthorized(self, client_mock: TestClient):
        response = client_mock.get("/api/cart")
        assert response.status_code == 401

    def test_add_to_cart_unauthorized(self, client_mock: TestClient):
        payload = {"menu_item_id": 1, "quantity": 2}
        response = client_mock.post("/api/cart", json=payload)
        assert response.status_code == 401

    def test_update_cart_item_unauthorized(self, client_mock: TestClient):
        payload = {"quantity": 3}
        response = client_mock.put("/api/cart/1", json=payload)
        assert response.status_code == 401

    def test_remove_from_cart_unauthorized(self, client_mock: TestClient):
        response = client_mock.delete("/api/cart/1")
        assert response.status_code == 401

    def test_clear_cart_unauthorized(self, client_mock: TestClient):
        response = client_mock.delete("/api/cart")
        assert response.status_code == 401

    def test_get_cart_authorized(
            self,
            client_mock: TestClient,
            mock_db_session):
        from backend.auth import get_password_hash

        unique_username = "testuser_cart"
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.username = unique_username
        mock_user.hashed_password = get_password_hash("testpass")
        mock_user.role = "user"

        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_user
        mock_db_session.query.return_value.filter.return_value.all.return_value = []

        login_payload = {"username": unique_username, "password": "testpass"}
        login_response = client_mock.post(
            "/api/auth/login", json=login_payload)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = client_mock.get("/api/cart", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_add_to_cart_authorized(
            self,
            client_mock: TestClient,
            mock_db_session):
        from backend.auth import get_password_hash

        unique_username = "testuser_cart_add"
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.username = unique_username
        mock_user.hashed_password = get_password_hash("testpass")
        mock_user.role = "user"

        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_user

        new_item = MagicMock()
        new_item.id = 1
        new_item.user_id = 1
        new_item.menu_item_id = 1
        new_item.quantity = 2

        def add_side_effect(item):
            item.id = 1

        mock_db_session.add.side_effect = add_side_effect
        mock_db_session.refresh.side_effect = lambda x: setattr(x, 'id', 1)

        login_payload = {"username": unique_username, "password": "testpass"}
        login_response = client_mock.post(
            "/api/auth/login", json=login_payload)
        token = login_response.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        payload = {"menu_item_id": 1, "quantity": 2}
        response = client_mock.post("/api/cart", json=payload, headers=headers)
        assert response.status_code == 201

    def test_cart_operations_full_flow(
            self, client_mock: TestClient, mock_db_session):
        from backend.auth import get_password_hash

        unique_username = "testuser_cart_flow"
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.username = unique_username
        mock_user.hashed_password = get_password_hash("testpass")
        mock_user.role = "user"

        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_user

        cart_item = MagicMock()
        cart_item.id = 1
        cart_item.user_id = 1
        cart_item.menu_item_id = 1
        cart_item.quantity = 2

        mock_db_session.query.return_value.filter.return_value.all.return_value = [
            cart_item]

        login_payload = {"username": unique_username, "password": "testpass"}
        login_response = client_mock.post(
            "/api/auth/login", json=login_payload)
        token = login_response.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}

        response = client_mock.get("/api/cart", headers=headers)
        assert response.status_code == 200

        update_payload = {"quantity": 5}
        response = client_mock.put(
            "/api/cart/1",
            json=update_payload,
            headers=headers)
        assert response.status_code in [200, 404]

        response = client_mock.delete("/api/cart/1", headers=headers)
        assert response.status_code in [204, 404]
