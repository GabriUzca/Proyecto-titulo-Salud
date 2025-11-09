from django.contrib import admin
from .models import Actividad

@admin.register(Actividad)
class ActividadAdmin(admin.ModelAdmin):
    list_display = ['user', 'tipo', 'duracion_min', 'calorias', 'fecha', 'creado']
    list_filter = ['tipo', 'fecha']
    search_fields = ['user__username']