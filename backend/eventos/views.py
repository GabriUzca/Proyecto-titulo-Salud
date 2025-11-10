from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from math import radians, sin, cos, sqrt, atan2
from .models import EventRequest
from .serializers import EventRequestSerializer, EventRequestAdminSerializer


class IsAdminUser(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a usuarios staff
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class EventRequestCreateView(generics.CreateAPIView):
    """
    Vista pública para crear solicitudes de eventos
    No requiere autenticación - cualquiera puede enviar una solicitud

    POST /api/eventos/solicitar/
    """
    queryset = EventRequest.objects.all()
    serializer_class = EventRequestSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        """
        Guarda la solicitud con estado 'pendiente'
        """
        serializer.save(estado='pendiente')


class EventRequestAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para administración de solicitudes de eventos
    Solo accesible para usuarios staff

    Endpoints:
    - GET    /api/eventos/admin/           - Listar todas las solicitudes
    - GET    /api/eventos/admin/{id}/      - Ver detalle de una solicitud
    - PATCH  /api/eventos/admin/{id}/      - Actualizar solicitud
    - DELETE /api/eventos/admin/{id}/      - Eliminar solicitud
    - POST   /api/eventos/admin/{id}/aprobar/  - Aprobar solicitud
    - POST   /api/eventos/admin/{id}/rechazar/ - Rechazar solicitud
    - GET    /api/eventos/admin/statistics/    - Estadísticas
    """
    serializer_class = EventRequestAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset = EventRequest.objects.all().order_by('-fecha_solicitud')

    def get_queryset(self):
        """
        Permite filtrar solicitudes por estado y búsqueda
        """
        queryset = super().get_queryset()

        # Filtro por estado
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado=estado)

        # Filtro por búsqueda (nombre del evento, empresa, contacto)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = (
                queryset.filter(nombre_evento__icontains=search)
                | queryset.filter(nombre_empresa__icontains=search)
                | queryset.filter(nombre_contacto__icontains=search)
                | queryset.filter(email_contacto__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """
        Aprueba una solicitud de evento
        POST /api/eventos/admin/{id}/aprobar/

        Body (opcional):
        {
            "comentarios_admin": "Comentarios del administrador"
        }
        """
        solicitud = self.get_object()

        if solicitud.estado == 'aprobada':
            return Response(
                {"error": "Esta solicitud ya está aprobada"},
                status=status.HTTP_400_BAD_REQUEST
            )

        solicitud.estado = 'aprobada'
        solicitud.fecha_respuesta = timezone.now()
        solicitud.respondido_por = request.user

        # Agregar comentarios si se proporcionan
        comentarios = request.data.get('comentarios_admin', '')
        if comentarios:
            solicitud.comentarios_admin = comentarios

        solicitud.save()

        serializer = self.get_serializer(solicitud)
        return Response({
            "message": "Solicitud aprobada exitosamente",
            "solicitud": serializer.data
        })

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """
        Rechaza una solicitud de evento
        POST /api/eventos/admin/{id}/rechazar/

        Body (requerido):
        {
            "comentarios_admin": "Motivo del rechazo"
        }
        """
        solicitud = self.get_object()

        if solicitud.estado == 'rechazada':
            return Response(
                {"error": "Esta solicitud ya está rechazada"},
                status=status.HTTP_400_BAD_REQUEST
            )

        comentarios = request.data.get('comentarios_admin', '')
        if not comentarios:
            return Response(
                {"error": "Debes proporcionar un motivo de rechazo en 'comentarios_admin'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        solicitud.estado = 'rechazada'
        solicitud.fecha_respuesta = timezone.now()
        solicitud.respondido_por = request.user
        solicitud.comentarios_admin = comentarios
        solicitud.save()

        serializer = self.get_serializer(solicitud)
        return Response({
            "message": "Solicitud rechazada exitosamente",
            "solicitud": serializer.data
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Obtiene estadísticas de solicitudes de eventos
        GET /api/eventos/admin/statistics/
        """
        total = EventRequest.objects.count()
        pendientes = EventRequest.objects.filter(estado='pendiente').count()
        aprobadas = EventRequest.objects.filter(estado='aprobada').count()
        rechazadas = EventRequest.objects.filter(estado='rechazada').count()

        return Response({
            "total": total,
            "pendientes": pendientes,
            "aprobadas": aprobadas,
            "rechazadas": rechazadas,
        })


def calcular_distancia(lat1, lon1, lat2, lon2):
    """
    Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
    Retorna la distancia en kilómetros
    """
    R = 6371  # Radio de la Tierra en kilómetros

    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)

    a = sin(delta_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(delta_lon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    distancia = R * c
    return distancia


class EventosAprobadosView(generics.ListAPIView):
    """
    Vista pública para obtener eventos aprobados
    Filtra por ubicación geográfica y rango de fechas

    GET /api/eventos/aprobados/

    Query params:
    - lat: latitud del centro de búsqueda (requerido)
    - lng: longitud del centro de búsqueda (requerido)
    - radio: radio de búsqueda en kilómetros (default: 40)
    - dias_futuros: días hacia el futuro para filtrar eventos (default: 90)
    """
    serializer_class = EventRequestSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        Filtra eventos aprobados por ubicación y fecha
        """
        # Parámetros de ubicación
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radio = float(self.request.query_params.get('radio', 40))  # 40 km por defecto
        dias_futuros = int(self.request.query_params.get('dias_futuros', 90))  # 90 días por defecto

        if not lat or not lng:
            return EventRequest.objects.none()

        try:
            lat = float(lat)
            lng = float(lng)
        except (ValueError, TypeError):
            return EventRequest.objects.none()

        # Filtrar por estado aprobada
        queryset = EventRequest.objects.filter(estado='aprobada')

        # Filtrar por fecha (eventos futuros o en curso)
        fecha_actual = timezone.now().date()
        fecha_limite = fecha_actual + timedelta(days=dias_futuros)

        # Incluir eventos que:
        # 1. Su fecha_inicio es futura (dentro del rango)
        # 2. O están en curso (fecha_inicio <= hoy y fecha_fin >= hoy o fecha_fin es None)
        queryset = queryset.filter(
            fecha_inicio__lte=fecha_limite
        ).exclude(
            fecha_fin__lt=fecha_actual  # Excluir eventos que ya terminaron
        )

        # Filtrar por distancia
        eventos_cercanos = []
        for evento in queryset:
            if evento.latitud and evento.longitud:
                distancia = calcular_distancia(lat, lng, evento.latitud, evento.longitud)
                if distancia <= radio:
                    eventos_cercanos.append(evento.id)

        return EventRequest.objects.filter(id__in=eventos_cercanos).order_by('fecha_inicio')
