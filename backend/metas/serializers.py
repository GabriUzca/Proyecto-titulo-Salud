from rest_framework import serializers
from .models import MetaPeso


class MetaPesoSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo MetaPeso.
    Incluye campos calculados y propiedades.
    """
    dias_restantes = serializers.ReadOnlyField()
    dias_totales = serializers.ReadOnlyField()
    tipo_meta = serializers.ReadOnlyField()
    ritmo_validacion = serializers.ReadOnlyField()

    class Meta:
        model = MetaPeso
        fields = [
            'id',
            'peso_actual',
            'peso_objetivo',
            'fecha_inicio',
            'fecha_objetivo',
            'nivel_actividad',
            'activo',
            'tmb',
            'get',
            'deficit_diario',
            'meta_calorica_diaria',
            'dias_restantes',
            'dias_totales',
            'tipo_meta',
            'ritmo_validacion',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'fecha_inicio',
            'tmb',
            'get',
            'deficit_diario',
            'meta_calorica_diaria',
            'created_at',
            'updated_at',
        ]

    def validate_fecha_objetivo(self, value):
        """Valida que la fecha objetivo sea futura."""
        from datetime import date

        if value <= date.today():
            raise serializers.ValidationError(
                "La fecha objetivo debe ser posterior a hoy."
            )

        return value

    def validate(self, data):
        """Validaciones adicionales."""
        peso_actual = data.get('peso_actual')
        peso_objetivo = data.get('peso_objetivo')

        if peso_actual and peso_objetivo:
            if peso_actual == peso_objetivo:
                raise serializers.ValidationError(
                    "El peso actual y el peso objetivo no pueden ser iguales."
                )

            # Validar que el cambio no sea extremo
            diferencia = abs(peso_actual - peso_objetivo)
            if diferencia > 50:
                raise serializers.ValidationError(
                    "La diferencia entre peso actual y objetivo no puede ser mayor a 50 kg. "
                    "Por favor, establece metas más pequeñas y alcanzables."
                )

        return data


class MetaPesoCreateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para crear metas.
    """

    class Meta:
        model = MetaPeso
        fields = [
            'peso_actual',
            'peso_objetivo',
            'fecha_objetivo',
            'nivel_actividad',
        ]

    def validate_fecha_objetivo(self, value):
        """Valida que la fecha objetivo sea futura."""
        from datetime import date

        if value <= date.today():
            raise serializers.ValidationError(
                "La fecha objetivo debe ser posterior a hoy."
            )

        return value

    def validate(self, data):
        """Validaciones adicionales."""
        peso_actual = data.get('peso_actual')
        peso_objetivo = data.get('peso_objetivo')

        if peso_actual and peso_objetivo:
            if peso_actual == peso_objetivo:
                raise serializers.ValidationError(
                    "El peso actual y el peso objetivo no pueden ser iguales."
                )

            diferencia = abs(peso_actual - peso_objetivo)
            if diferencia > 50:
                raise serializers.ValidationError(
                    "La diferencia entre peso actual y objetivo no puede ser mayor a 50 kg."
                )

        return data
