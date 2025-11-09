from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import datetime

class RecomendacionesTests(APITestCase):
    def setUp(self):
        User.objects.create_user(username="eva", password="secret123")
        r = self.client.post("/api/auth/login", {"username": "eva", "password": "secret123"})
        self.access = r.data["access"]
        self.url = "/api/recommendations/locales/?comuna=Santiago"

    def test_requires_auth(self):
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_returns_list_with_expected_shape(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("comuna", r.data)
        self.assertIn("total", r.data)
        self.assertIn("items", r.data)
        self.assertGreaterEqual(r.data["total"], 1)
        self.assertIsInstance(r.data["items"], list)
        item = r.data["items"][0]
        for k in ("titulo", "lugar", "lat", "lng", "fecha"):
            self.assertIn(k, item)
        # fecha es ISO-8601 parseable
        datetime.fromisoformat(item["fecha"])
