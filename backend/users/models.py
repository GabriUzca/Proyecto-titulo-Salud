from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    SEXO_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    edad = models.PositiveIntegerField(null=True, blank=True)
    peso = models.FloatField(null=True, blank=True)
    altura = models.FloatField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, null=True, blank=True)

    def __str__(self):
        return self.user.username
