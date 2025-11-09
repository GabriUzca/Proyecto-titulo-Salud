from django.contrib import admin
from .models import EventRequest


@admin.register(EventRequest)
class EventRequestAdmin(admin.ModelAdmin):
    """
    Administración de solicitudes de eventos en Django Admin
    """
    list_display = [
        'nombre_evento',
        'nombre_contacto',
        'email_contacto',
        'estado',
        'categoria',
        'ciudad',
        'fecha_inicio',
        'fecha_solicitud',
    ]
    list_filter = ['estado', 'categoria', 'tipo_entrada', 'ciudad', 'fecha_solicitud']
    search_fields = [
        'nombre_evento',
        'nombre_contacto',
        'email_contacto',
        'nombre_empresa',
        'ciudad',
    ]
    readonly_fields = ['fecha_solicitud', 'fecha_respuesta']

    fieldsets = (
        ('Información de Contacto', {
            'fields': (
                'nombre_contacto',
                'email_contacto',
                'telefono_contacto',
                'nombre_empresa',
            )
        }),
        ('Información del Evento', {
            'fields': (
                'nombre_evento',
                'descripcion',
                'fecha_inicio',
                'fecha_fin',
                'categoria',
                'tipo_entrada',
                'precio',
                'url_evento',
                'imagen_url',
            )
        }),
        ('Ubicación', {
            'fields': (
                'direccion',
                'ciudad',
                'latitud',
                'longitud',
            )
        }),
        ('Estado de la Solicitud', {
            'fields': (
                'estado',
                'fecha_solicitud',
                'fecha_respuesta',
                'comentarios_admin',
                'respondido_por',
            )
        }),
    )

    def get_queryset(self, request):
        """
        Ordena por fecha de solicitud (más recientes primero)
        """
        qs = super().get_queryset(request)
        return qs.order_by('-fecha_solicitud')
