from django.db import models
from django.conf import settings

class Comida(models.Model):
    HORARIO_CHOICES = [
        ("desayuno", "Desayuno"),
        ("almuerzo", "Almuerzo"),
        ("cena", "Cena"),
        ("snack", "Snack"),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="comidas"
    )
    nombre = models.CharField(max_length=120)
    calorias = models.PositiveIntegerField()
    horario = models.CharField(max_length=50, choices=HORARIO_CHOICES)
    fecha = models.DateField()
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha", "-creado"]
        verbose_name = "Comida"
        verbose_name_plural = "Comidas"

    def __str__(self):
        return f"{self.user.username} - {self.nombre} ({self.fecha})"