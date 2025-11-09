from django.db import models
from django.contrib.auth.models import User


class EventRequest(models.Model):
    """
    Modelo para almacenar solicitudes de eventos de empresas/personas
    que quieren agregar sus eventos a la plataforma
    """

    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
    ]

    CATEGORIA_CHOICES = [
        ('deportivo', 'Deportivo'),
        ('cultural', 'Cultural'),
        ('salud', 'Salud y Bienestar'),
        ('recreativo', 'Recreativo'),
        ('educativo', 'Educativo'),
        ('otro', 'Otro'),
    ]

    TIPO_ENTRADA_CHOICES = [
        ('gratuito', 'Gratuito'),
        ('pago', 'De Pago'),
    ]

    # ── Datos de contacto ──────────────────────────────────────────────────
    nombre_contacto = models.CharField(max_length=200, verbose_name="Nombre de contacto")
    email_contacto = models.EmailField(verbose_name="Email de contacto")
    telefono_contacto = models.CharField(max_length=20, verbose_name="Teléfono de contacto")
    nombre_empresa = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name="Nombre de empresa/organización"
    )

    # ── Datos del evento ───────────────────────────────────────────────────
    nombre_evento = models.CharField(max_length=300, verbose_name="Nombre del evento")
    descripcion = models.TextField(verbose_name="Descripción del evento")
    fecha_inicio = models.DateTimeField(verbose_name="Fecha y hora de inicio")
    fecha_fin = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Fecha y hora de fin"
    )
    categoria = models.CharField(
        max_length=20,
        choices=CATEGORIA_CHOICES,
        default='otro',
        verbose_name="Categoría"
    )
    tipo_entrada = models.CharField(
        max_length=20,
        choices=TIPO_ENTRADA_CHOICES,
        default='gratuito',
        verbose_name="Tipo de entrada"
    )
    precio = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Precio (si aplica)"
    )
    url_evento = models.URLField(
        blank=True,
        null=True,
        verbose_name="URL del evento"
    )
    imagen_url = models.URLField(
        blank=True,
        null=True,
        verbose_name="URL de imagen del evento"
    )

    # ── Ubicación ──────────────────────────────────────────────────────────
    direccion = models.CharField(max_length=500, verbose_name="Dirección")
    ciudad = models.CharField(max_length=100, verbose_name="Ciudad")
    latitud = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name="Latitud"
    )
    longitud = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        verbose_name="Longitud"
    )

    # ── Estado de la solicitud ─────────────────────────────────────────────
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='pendiente',
        verbose_name="Estado"
    )
    fecha_solicitud = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de solicitud")
    fecha_respuesta = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Fecha de respuesta"
    )
    comentarios_admin = models.TextField(
        blank=True,
        null=True,
        verbose_name="Comentarios del administrador"
    )
    respondido_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='event_requests_respondidas',
        verbose_name="Respondido por"
    )

    class Meta:
        verbose_name = "Solicitud de Evento"
        verbose_name_plural = "Solicitudes de Eventos"
        ordering = ['-fecha_solicitud']

    def __str__(self):
        return f"{self.nombre_evento} - {self.get_estado_display()}"
