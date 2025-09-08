from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    edad   = models.PositiveIntegerField(null=True, blank=True)
    peso   = models.FloatField(null=True, blank=True)
    altura = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.user.username
