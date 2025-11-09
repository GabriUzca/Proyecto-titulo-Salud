from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import UserProfile

class MeUpdateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="gabi", password="secret123")
        self.profile_url = "/api/auth/me"
        self.update_url = "/api/auth/me/update"
        r = self.client.post("/api/auth/login", {"username": "gabi", "password": "secret123"})
        self.access = r.data["access"]

    def test_get_me_requires_auth(self):
        self.assertEqual(self.client.get(self.profile_url).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_and_names(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        payload = {"first_name": "Gabriel", "last_name": "Uzcategui", "edad": 29, "peso": 70.5, "altura": 175.0}
        r = self.client.put(self.update_url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Gabriel")
        self.assertEqual(self.user.last_name, "Uzcategui")
        p = UserProfile.objects.get(user=self.user)
        self.assertEqual(p.edad, 29)
        self.assertEqual(float(p.peso), 70.5)
        self.assertEqual(float(p.altura), 175.0)
