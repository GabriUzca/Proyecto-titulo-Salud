from django.db import models
from django.conf import settings

class Actividad(models.Model):
    TIPO_CHOICES = [
        ("caminar", "Caminar"),
        ("correr", "Correr"),
        ("bicicleta", "Bicicleta"),
        ("gimnasio", "Gimnasio"),
        ("otro", "Otro"),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="actividades"
    )
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES)
    duracion_min = models.PositiveIntegerField()
    calorias = models.PositiveIntegerField(null=True, blank=True)
    fecha = models.DateField()
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha", "-creado"]
        verbose_name = "Actividad"
        verbose_name_plural = "Actividades"

    def __str__(self):
        return f"{self.user.username} - {self.tipo} ({self.fecha})"