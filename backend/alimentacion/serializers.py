from rest_framework import serializers
from .models import Comida

class ComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = ["id", "nombre", "calorias", "horario", "fecha", "creado"]
        read_only_fields = ["id", "creado"]