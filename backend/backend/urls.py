# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/actividad/', include('actividad.urls')),
    path('api/alimentacion/', include('alimentacion.urls')),
    path('api/recommendations/', include('recomendaciones.urls')),
    path('api/auth/', include('users.urls')),
    path('api/admin/', include('users.admin_urls')),
    path('api/eventos/', include('eventos.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
