from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date
from .models import Comida

class ComidaApiTests(APITestCase):
    def setUp(self):
        self.u1 = User.objects.create_user(username="cami", password="secret123")
        self.u2 = User.objects.create_user(username="dani", password="secret123")
        self.token_u1 = self._login("cami", "secret123")
        self.token_u2 = self._login("dani", "secret123")
        self.base = "/api/alimentacion/"

    def _login(self, username, password):
        r = self.client.post("/api/auth/login", {"username": username, "password": password})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        return r.data["access"]

    def test_requires_auth(self):
        self.assertEqual(self.client.get(self.base).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_only_own_records(self):
        Comida.objects.create(user=self.u1, nombre="Ensalada", calorias=300, horario="almuerzo", fecha=date.today())
        Comida.objects.create(user=self.u2, nombre="Pizza",    calorias=500, horario="cena",     fecha=date.today())

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_u1}")
        r = self.client.get(self.base)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)
        self.assertEqual(r.data[0]["nombre"], "Ensalada")

    def test_create_assigns_user_automatically(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_u1}")
        payload = {"nombre": "Avena", "calorias": 250, "horario": "desayuno", "fecha": str(date.today())}
        r = self.client.post(self.base, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        obj = Comida.objects.get(id=r.data["id"])
        self.assertEqual(obj.user, self.u1)

    def test_cannot_touch_others_records(self):
        c_ajena = Comida.objects.create(user=self.u2, nombre="Sopa", calorias=150, horario="cena", fecha=date.today())
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_u1}")
        self.assertEqual(self.client.get(f"{self.base}{c_ajena.id}/").status_code, status.HTTP_404_NOT_FOUND)
