from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, MeView, MeUpdateView, CustomTokenObtainPairView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', CustomTokenObtainPairView.as_view(), name='login'),  # Vista personalizada para login con email o username
    path('refresh', TokenRefreshView.as_view(), name='refresh'),
    path('me', MeView.as_view(), name='me'),
    path('me/update', MeUpdateView.as_view(), name='me-update'),
    path('perfil', MeUpdateView.as_view(), name='perfil-update'),  # Alias para actualizar perfil
]