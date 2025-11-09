from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import UserProfile


class AdminUserManagementTests(TestCase):
    """
    Tests para la gestión de usuarios desde el panel de administración
    """
    
    def setUp(self):
        """Configuración inicial para cada test"""
        self.client = APIClient()
        
        # Crear admin
        self.admin = User.objects.create_user(
            username='admin',
            password='admin123',
            is_staff=True,
            is_superuser=True
        )
        
        # Crear usuario regular
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123',
            first_name='Test',
            last_name='User'
        )
        UserProfile.objects.create(
            user=self.user,
            edad=25,
            peso=70.0,
            altura=175.0
        )
        
        # Crear usuario inactivo
        self.inactive_user = User.objects.create_user(
            username='inactive',
            password='test123',
            is_active=False
        )
    
    def get_admin_token(self):
        """Obtiene token JWT para el admin"""
        response = self.client.post('/api/auth/login', {
            'username': 'admin',
            'password': 'admin123'
        })
        return response.data['access']
    
    def get_user_token(self):
        """Obtiene token JWT para usuario regular"""
        response = self.client.post('/api/auth/login', {
            'username': 'testuser',
            'password': 'test123'
        })
        return response.data['access']
    
    def test_list_users_as_admin(self):
        """Admin puede listar todos los usuarios"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/admin/users/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 3)  # admin + user + inactive
    
    def test_list_users_as_regular_user(self):
        """Usuario regular NO puede listar usuarios"""
        token = self.get_user_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/admin/users/')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_filter_active_users(self):
        """Filtrar usuarios activos"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/admin/users/?is_active=true')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for user in response.data:
            self.assertTrue(user['is_active'])
    
    def test_filter_inactive_users(self):
        """Filtrar usuarios inactivos"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/admin/users/?is_active=false')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for user in response.data:
            self.assertFalse(user['is_active'])
    
    def test_search_users(self):
        """Buscar usuarios por nombre/email"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/admin/users/?search=test')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
    
    def test_get_user_detail(self):
        """Obtener detalle de un usuario específico"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get(f'/api/admin/users/{self.user.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertIn('profile', response.data)
        self.assertEqual(response.data['profile']['edad'], 25)
    
    def test_toggle_user_active(self):
        """Activar/desactivar un usuario"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Desactivar usuario activo
        response = self.client.post(f'/api/admin/users/{self.user.id}/toggle_active/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_active'])
        
        # Verificar en la base de datos
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
        
        # Activar usuario inactivo
        response = self.client.post(f'/api/admin/users/{self.user.id}/toggle_active/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_active'])
        
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
    
    def test_cannot_deactivate_own_account(self):
        """Admin no puede desactivar su propia cuenta"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.post(f'/api/admin/users/{self.admin.id}/toggle_active/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_update_user_basic_info(self):
        """Actualizar información básica de un usuario"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com',
            'edad': 30,
            'peso': 75.5,
            'altura': 180.0
        }
        
        response = self.client.patch(
            f'/api/admin/users/{self.user.id}/update_basic_info/',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar cambios en User
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')
        self.assertEqual(self.user.last_name, 'Name')
        self.assertEqual(self.user.email, 'updated@example.com')
        
        # Verificar cambios en Profile
        profile = self.user.profile
        self.assertEqual(profile.edad, 30)
        self.assertEqual(float(profile.peso), 75.5)
        self.assertEqual(float(profile.altura), 180.0)
    
    def test_cannot_use_duplicate_email(self):
        """No se puede usar un email que ya existe"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Crear otro usuario con email
        other_user = User.objects.create_user(
            username='other',
            email='other@example.com',
            password='test123'
        )
        
        # Intentar usar el email del otro usuario
        response = self.client.patch(
            f'/api/admin/users/{self.user.id}/update_basic_info/',
            {'email': 'other@example.com'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_get_statistics(self):
        """Obtener estadísticas de usuarios"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/admin/users/statistics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('active_users', response.data)
        self.assertIn('inactive_users', response.data)
        self.assertIn('staff_users', response.data)
        self.assertIn('regular_users', response.data)
        
        # Verificar valores
        self.assertEqual(response.data['total_users'], 3)  # admin + user + inactive
        self.assertEqual(response.data['active_users'], 2)  # admin + user
        self.assertEqual(response.data['inactive_users'], 1)  # inactive
        self.assertEqual(response.data['staff_users'], 1)  # admin
    
    def test_user_serializer_includes_activity_counts(self):
        """El serializer incluye conteo de actividades y comidas"""
        from actividad.models import Actividad
        from alimentacion.models import Comida
        from datetime import date
        
        # Crear algunas actividades y comidas
        Actividad.objects.create(
            user=self.user,
            tipo='caminar',
            duracion_min=30,
            fecha=date.today()
        )
        Comida.objects.create(
            user=self.user,
            nombre='Desayuno',
            calorias=300,
            horario='desayuno',
            fecha=date.today()
        )
        
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get(f'/api/admin/users/{self.user.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_actividades'], 1)
        self.assertEqual(response.data['total_comidas'], 1)
    
    def test_update_partial_fields(self):
        """Se puede actualizar solo algunos campos"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Solo actualizar el nombre
        response = self.client.patch(
            f'/api/admin/users/{self.user.id}/update_basic_info/',
            {'first_name': 'NewName'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'NewName')
        self.assertEqual(self.user.last_name, 'User')  # No cambió
    
    def test_unauthorized_access_without_token(self):
        """Acceso sin token retorna 401"""
        response = self.client.get('/api/admin/users/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_list_ordering(self):
        """Los usuarios se listan ordenados por fecha de registro (más recientes primero)"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/admin/users/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que están ordenados (el último creado aparece primero)
        usernames = [u['username'] for u in response.data]
        # inactive fue el último creado, luego user, luego admin
        self.assertEqual(usernames[0], 'inactive')
    
    def test_profile_created_for_new_user(self):
        """Verificar que se crea perfil automáticamente para nuevos usuarios"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Crear nuevo usuario
        new_user = User.objects.create_user(
            username='newuser',
            email='new@example.com',
            password='test123'
        )
        
        # Obtener detalle del usuario
        response = self.client.get(f'/api/admin/users/{new_user.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('profile', response.data)
        # El perfil debe existir aunque esté vacío
        self.assertIsNotNone(response.data['profile'])
    
    def test_search_by_email(self):
        """Buscar usuarios por email"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/admin/users/?search=test@example.com')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], 'test@example.com')
    
    def test_search_by_first_name(self):
        """Buscar usuarios por nombre"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.get('/api/admin/users/?search=Test')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        # Verificar que al menos uno tiene "Test" en el nombre
        found = any('Test' in u.get('first_name', '') for u in response.data)
        self.assertTrue(found)
    
    def test_update_only_profile_fields(self):
        """Actualizar solo campos del perfil sin tocar User"""
        token = self.get_admin_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        original_email = self.user.email
        
        # Solo actualizar campos del perfil
        response = self.client.patch(
            f'/api/admin/users/{self.user.id}/update_basic_info/',
            {'edad': 35, 'peso': 80.0},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        # Email no debe cambiar
        self.assertEqual(self.user.email, original_email)
        # Pero los campos del perfil sí
        self.assertEqual(self.user.profile.edad, 35)
        self.assertEqual(float(self.user.profile.peso), 80.0)