from rest_framework import serializers
from .models import Actividad

class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = ["id", "tipo", "duracion_min", "calorias", "fecha", "creado"]
        read_only_fields = ["id", "creado"]