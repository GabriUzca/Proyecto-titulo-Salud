from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventRequestCreateView,
    EventRequestAdminViewSet,
    EventosAprobadosView,
    TicketmasterProxyView,
    ConsultarSolicitudView
)

# Router para las vistas de administración
router = DefaultRouter()
router.register(r'admin', EventRequestAdminViewSet, basename='event-request-admin')

urlpatterns = [
    # Endpoint público para crear solicitudes (sin autenticación)
    path('solicitar/', EventRequestCreateView.as_view(), name='event-request-create'),

    # Endpoint público para obtener eventos aprobados (sin autenticación)
    path('aprobados/', EventosAprobadosView.as_view(), name='eventos-aprobados'),

    # Endpoint público para consultar estado de solicitud por código (sin autenticación)
    path('consultar/<str:codigo>/', ConsultarSolicitudView.as_view(), name='consultar-solicitud'),

    # Endpoint público para proxy de Ticketmaster (sin autenticación)
    path('ticketmaster/', TicketmasterProxyView.as_view(), name='ticketmaster-proxy'),

    # Endpoints de administración (requieren autenticación y permisos de staff)
    path('', include(router.urls)),
]
