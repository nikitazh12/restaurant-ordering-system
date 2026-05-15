from fastapi.testclient import TestClient
from unittest.mock import MagicMock


class TestFavoritesEndpoints:
    def test_get_favorites_unauthorized(self, client_mock: TestClient):
        response = client_mock.get("/api/favorites")
        assert response.status_code == 401

    def test_add_to_favorites_unauthorized(self, client_mock: TestClient):
        payload = {"menu_item_id": 1}
        response = client_mock.post("/api/favorites", json=payload)
        assert response.status_code == 401

    def test_remove_from_favorites_unauthorized(self, client_mock: TestClient):
        response = client_mock.delete("/api/favorites/1")
        assert response.status_code == 401

    def test_get_favorites_authorized(
            self,
            client_mock: TestClient,
            mock_db_session):
        from backend.auth import get_password_hash

        unique_username = "testuser_fav"
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
        response = client_mock.get("/api/favorites", headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_add_to_favorites_authorized(
            self, client_mock: TestClient, mock_db_session):
        from backend.auth import get_password_hash

        unique_username = "testuser_fav_add"
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

        def add_side_effect(item):
            item.id = 1

        mock_db_session.add.side_effect = add_side_effect
        mock_db_session.refresh.side_effect = lambda x: setattr(x, 'id', 1)

        login_payload = {"username": unique_username, "password": "testpass"}
        login_response = client_mock.post(
            "/api/auth/login", json=login_payload)
        token = login_response.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        payload = {"menu_item_id": 1}
        response = client_mock.post(
            "/api/favorites", json=payload, headers=headers)
        assert response.status_code in [201, 400]

    def test_favorites_operations_flow(
            self, client_mock: TestClient, mock_db_session):
        from backend.auth import get_password_hash

        unique_username = "testuser_fav_flow"
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.username = unique_username
        mock_user.hashed_password = get_password_hash("testpass")
        mock_user.role = "user"

        mock_db_session.query.return_value.filter.return_value.first.return_value = mock_user

        fav_item = MagicMock()
        fav_item.id = 1
        fav_item.user_id = 1
        fav_item.menu_item_id = 1

        mock_db_session.query.return_value.filter.return_value.all.return_value = [
            fav_item]

        login_payload = {"username": unique_username, "password": "testpass"}
        login_response = client_mock.post(
            "/api/auth/login", json=login_payload)
        token = login_response.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}

        response = client_mock.get("/api/favorites", headers=headers)
        assert response.status_code == 200

        response = client_mock.delete("/api/favorites/1", headers=headers)
        assert response.status_code in [204, 404]
