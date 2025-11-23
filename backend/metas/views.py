from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MetaPeso
from .serializers import MetaPesoSerializer, MetaPesoCreateSerializer


class MetaPesoListCreateView(generics.ListCreateAPIView):
    """
    GET: Lista todas las metas del usuario (activas e inactivas)
    POST: Crea una nueva meta
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MetaPesoCreateSerializer
        return MetaPesoSerializer

    def get_queryset(self):
        """Solo retorna las metas del usuario autenticado."""
        return MetaPeso.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Al crear una nueva meta:
        1. Desactiva todas las metas anteriores del usuario
        2. Crea la nueva meta como activa
        """
        # Desactivar todas las metas anteriores
        MetaPeso.objects.filter(user=self.request.user, activo=True).update(activo=False)

        # Crear la nueva meta
        serializer.save(user=self.request.user)


class MetaPesoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Obtiene los detalles de una meta específica
    PUT/PATCH: Actualiza una meta
    DELETE: Elimina una meta
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MetaPesoSerializer

    def get_queryset(self):
        """Solo permite acceder a metas del usuario autenticado."""
        return MetaPeso.objects.filter(user=self.request.user)


class MetaActivaView(APIView):
    """
    GET: Obtiene la meta activa del usuario (si existe)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            meta = MetaPeso.objects.get(user=request.user, activo=True)
            serializer = MetaPesoSerializer(meta)
            return Response(serializer.data)
        except MetaPeso.DoesNotExist:
            return Response(
                {'detail': 'No tienes una meta activa. Crea una nueva meta para comenzar.'},
                status=status.HTTP_404_NOT_FOUND
            )


class ArchivarMetaView(APIView):
    """
    POST: Archiva (desactiva) la meta actual sin eliminarla
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            meta = MetaPeso.objects.get(pk=pk, user=request.user)
            meta.activo = False
            meta.save()
            return Response(
                {'detail': 'Meta archivada exitosamente.'},
                status=status.HTTP_200_OK
            )
        except MetaPeso.DoesNotExist:
            return Response(
                {'detail': 'Meta no encontrada.'},
                status=status.HTTP_404_NOT_FOUND
            )
