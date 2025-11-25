from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils.text import slugify
from .serializers import UserSerializer, UserAdminSerializer, UserProfileSerializer
from .models import UserProfile


class IsAdminUser(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a superusuarios
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class UserAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para administración de usuarios
    Permite listar, editar, activar/desactivar usuarios
    """
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')

    def get_queryset(self):
        """
        Permite filtrar usuarios por estado activo/inactivo y por búsqueda
        """
        queryset = super().get_queryset()

        # Filtro por estado
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Filtro por búsqueda
        search = self.request.query_params.get('search', None)
        if search:
            queryset = (
                queryset.filter(username__icontains=search)
                | queryset.filter(email__icontains=search)
                | queryset.filter(first_name__icontains=search)
                | queryset.filter(last_name__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Activa o desactiva una cuenta de usuario
        POST /api/admin/users/{id}/toggle_active/
        """
        user = self.get_object()

        # No permitir desactivar al propio usuario admin
        if user.id == request.user.id:
            return Response(
                {"error": "No puedes desactivar tu propia cuenta"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = not user.is_active
        user.save()

        return Response({
            "message": f"Usuario {'activado' if user.is_active else 'desactivado'} exitosamente",
            "is_active": user.is_active
        })

    @action(detail=True, methods=['patch'])
    def update_basic_info(self, request, pk=None):
        """
        Actualiza datos básicos del usuario y su perfil.
        Valida el email SOLO si viene no vacío y cambió respecto al actual.
        Convierte cadenas vacías del perfil a None para no pisar con "".
        """
        user = self.get_object()

        # --- Actualizar campos del modelo User ---
        first_name = (request.data.get('first_name') or '').strip()
        last_name = (request.data.get('last_name') or '').strip()
        new_email = (request.data.get('email') or '').strip()

        if 'first_name' in request.data:
            user.first_name = first_name
        if 'last_name' in request.data:
            user.last_name = last_name

        # Validar email único solo si:
        # - viene en el payload
        # - no está vacío
        # - y es distinto al actual (case-insensitive)
        if 'email' in request.data:
            current_email = (user.email or '').strip()
            if new_email and new_email.lower() != current_email.lower():
                exists = User.objects.filter(email__iexact=new_email).exclude(id=user.id).exists()
                if exists:
                    return Response(
                        {"error": "Este correo ya está registrado"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            # Asignar (permitir vacío si así se envía)
            user.email = new_email

        user.save()

        # --- Actualizar campos del perfil ---
        profile, _ = UserProfile.objects.get_or_create(user=user)
        for field in ['edad', 'peso', 'altura']:
            if field in request.data:
                val = request.data.get(field)
                # No guardar "" como valor numérico: usar None
                if val == '':
                    val = None
                setattr(profile, field, val)

        # Actualizar sexo si viene en el payload
        if 'sexo' in request.data:
            sexo_val = request.data.get('sexo')
            # Permitir vacío (None) o valores válidos (M, F, O)
            if sexo_val in ['M', 'F', 'O', '', None]:
                profile.sexo = sexo_val if sexo_val else None

        profile.save()

        serializer = self.get_serializer(user)
        return Response({
            "message": "Usuario actualizado exitosamente",
            "user": serializer.data
        })

    @action(detail=True, methods=['get'])
    def actividades(self, request, pk=None):
        """
        Obtiene todas las actividades del usuario
        GET /api/admin/users/{id}/actividades/
        """
        user = self.get_object()
        actividades = user.actividades.all().order_by('-fecha')

        # Serializar actividades
        from actividad.serializers import ActividadSerializer
        serializer = ActividadSerializer(actividades, many=True)

        return Response({
            "count": actividades.count(),
            "actividades": serializer.data
        })

    @action(detail=True, methods=['get'])
    def comidas(self, request, pk=None):
        """
        Obtiene todas las comidas del usuario
        GET /api/admin/users/{id}/comidas/
        """
        user = self.get_object()
        comidas = user.comidas.all().order_by('-fecha')

        # Serializar comidas
        from alimentacion.serializers import ComidaSerializer
        serializer = ComidaSerializer(comidas, many=True)

        return Response({
            "count": comidas.count(),
            "comidas": serializer.data
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Obtiene estadísticas generales de usuarios
        GET /api/admin/users/statistics/
        """
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        staff_users = User.objects.filter(is_staff=True).count()

        return Response({
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "staff_users": staff_users,
            "regular_users": total_users - staff_users
        })
