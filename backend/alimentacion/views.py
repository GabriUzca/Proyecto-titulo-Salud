from rest_framework import viewsets, permissions
from .models import Comida
from .serializers import ComidaSerializer

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class ComidaViewSet(viewsets.ModelViewSet):
    serializer_class = ComidaSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Comida.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)