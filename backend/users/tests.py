from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.base = "/api/auth"
        self.register_url = f"{self.base}/register"
        self.login_url = f"{self.base}/login"
        self.refresh_url = f"{self.base}/refresh"
        self.me_url = f"{self.base}/me"

    def test_register_login_me_refresh(self):
        # Registro
        data_reg = {"username": "gabi", "email": "gabi@x.com", "password": "secret123"}
        r = self.client.post(self.register_url, data_reg, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

        # Login
        data_login = {"username": "gabi", "password": "secret123"}
        r = self.client.post(self.login_url, data_login, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        access = r.data["access"]
        refresh = r.data["refresh"]

        # /me con token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        r = self.client.get(self.me_url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["username"], "gabi")

        # refresh
        r = self.client.post(self.refresh_url, {"refresh": refresh}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_cannot_login_with_bad_password(self):
        User.objects.create_user(username="failuser", password="ok12345")
        r = self.client.post(self.login_url, {"username": "failuser", "password": "WRONG"}, format="json")
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    class RegisterValidationTests(APITestCase):
        def setUp(self):
            self.register_url = "/api/auth/register"

        def test_password_min_length(self):
            # 7 chars → debe fallar
            r = self.client.post(self.register_url, {
                "username": "short",
                "email": "s@x.com",
                "password": "1234567"
            }, format="json")
            self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("password", r.data)

        def test_email_unique(self):
            User.objects.create_user(username="u1", email="dup@x.com", password="secret123")
            # mismo email con distinta capitalización → debe fallar
            r = self.client.post(self.register_url, {
                "username": "u2",
                "email": "Dup@x.com",
                "password": "secret123"
            }, format="json")
            self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn("email", r.data)