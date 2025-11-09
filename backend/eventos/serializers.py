from rest_framework import serializers
from .models import EventRequest
from django.contrib.auth.models import User


class EventRequestSerializer(serializers.ModelSerializer):
    """
    Serializer para crear solicitudes de eventos (sin autenticación)
    """
    respondido_por_nombre = serializers.SerializerMethodField()

    class Meta:
        model = EventRequest
        fields = [
            'id',
            # Datos de contacto
            'nombre_contacto',
            'email_contacto',
            'telefono_contacto',
            'nombre_empresa',
            # Datos del evento
            'nombre_evento',
            'descripcion',
            'fecha_inicio',
            'fecha_fin',
            'categoria',
            'tipo_entrada',
            'precio',
            'url_evento',
            'imagen_url',
            # Ubicación
            'direccion',
            'ciudad',
            'latitud',
            'longitud',
            # Estado (solo lectura para creación)
            'estado',
            'fecha_solicitud',
            'fecha_respuesta',
            'comentarios_admin',
            'respondido_por',
            'respondido_por_nombre',
        ]
        read_only_fields = [
            'id',
            'estado',
            'fecha_solicitud',
            'fecha_respuesta',
            'comentarios_admin',
            'respondido_por',
            'respondido_por_nombre',
        ]

    def get_respondido_por_nombre(self, obj):
        if obj.respondido_por:
            return obj.respondido_por.username
        return None

    def validate(self, data):
        """
        Validaciones personalizadas
        """
        # Si el tipo de entrada es "pago", el precio es obligatorio
        if data.get('tipo_entrada') == 'pago' and not data.get('precio'):
            raise serializers.ValidationError({
                'precio': 'El precio es obligatorio para eventos de pago'
            })

        # Si es gratuito, asegurar que precio sea None
        if data.get('tipo_entrada') == 'gratuito':
            data['precio'] = None

        return data


class EventRequestAdminSerializer(serializers.ModelSerializer):
    """
    Serializer para que el administrador gestione solicitudes
    """
    respondido_por_nombre = serializers.SerializerMethodField()

    class Meta:
        model = EventRequest
        fields = '__all__'
        read_only_fields = ['id', 'fecha_solicitud']

    def get_respondido_por_nombre(self, obj):
        if obj.respondido_por:
            return obj.respondido_por.username
        return None
