from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date
from .models import Actividad

class ActividadApiTests(APITestCase):
    def setUp(self):
        # Usuarios
        self.u1 = User.objects.create_user(username="ana", password="secret123")
        self.u2 = User.objects.create_user(username="beto", password="secret123")
        # Tokens
        self.token_u1 = self._login("ana", "secret123")
        self.token_u2 = self._login("beto", "secret123")
        # Endpoints
        self.base = "/api/actividad/"

    def _login(self, username, password):
        r = self.client.post("/api/auth/login", {"username": username, "password": password})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        return r.data["access"]

    def test_requires_auth(self):
        r = self.client.get(self.base)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_only_own_records(self):
        # Crear datos de ambos usuarios
        Actividad.objects.create(user=self.u1, tipo="caminar", duracion_min=20, fecha=date.today())
        Actividad.objects.create(user=self.u2, tipo="correr",  duracion_min=30, fecha=date.today())

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_u1}")
        r = self.client.get(self.base)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)
        self.assertEqual(r.data[0]["tipo"], "caminar")

    def test_create_assigns_user_automatically(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_u1}")
        payload = {"tipo": "gimnasio", "duracion_min": 45, "calorias": 250, "fecha": str(date.today())}
        r = self.client.post(self.base, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

        obj = Actividad.objects.get(id=r.data["id"])
        self.assertEqual(obj.user, self.u1)
        self.assertEqual(obj.tipo, "gimnasio")

    def test_cannot_retrieve_others_activity(self):
        a_ajena = Actividad.objects.create(user=self.u2, tipo="caminar", duracion_min=10, fecha=date.today())
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_u1}")
        # Por get_queryset filtrado + permiso de propietario, debe ser 404
        r = self.client.get(f"{self.base}{a_ajena.id}/")
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_and_delete_own_activity(self):
        a = Actividad.objects.create(user=self.u1, tipo="otro", duracion_min=15, fecha=date.today())
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_u1}")
        # PATCH
        r = self.client.patch(f"{self.base}{a.id}/", {"duracion_min": 25}, format="json")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        # DELETE
        r = self.client.delete(f"{self.base}{a.id}/")
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Actividad.objects.filter(id=a.id).exists())
