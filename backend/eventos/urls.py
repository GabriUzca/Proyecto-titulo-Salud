from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventRequestCreateView, EventRequestAdminViewSet, EventRequestPublicListView

# Router para las vistas de administración
router = DefaultRouter()
router.register(r'admin', EventRequestAdminViewSet, basename='event-request-admin')

urlpatterns = [
    # Endpoint público para crear solicitudes (sin autenticación)
    path('solicitar/', EventRequestCreateView.as_view(), name='event-request-create'),

       # Endpoint público para listar eventos aprobados (sin autenticación)
    path('aprobados/', EventRequestPublicListView.as_view(), name='event-request-public-list'),
   
    # Endpoints de administración (requieren autenticación y permisos de staff)
    path('', include(router.urls)),
]
