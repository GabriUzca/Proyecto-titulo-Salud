from django.contrib import admin
from .models import Comida

@admin.register(Comida)
class ComidaAdmin(admin.ModelAdmin):
    list_display = ['user', 'nombre', 'calorias', 'horario', 'fecha', 'creado']
    list_filter = ['horario', 'fecha']
    search_fields = ['user__username', 'nombre']