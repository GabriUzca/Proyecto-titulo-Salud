from django.urls import path
from .views import (
    MetaPesoListCreateView,
    MetaPesoDetailView,
    MetaActivaView,
    ArchivarMetaView,
)

urlpatterns = [
    # Lista y creación de metas
    path('', MetaPesoListCreateView.as_view(), name='meta-list-create'),

    # Meta activa del usuario
    path('activa', MetaActivaView.as_view(), name='meta-activa'),

    # Detalle, actualización y eliminación de una meta específica
    path('<int:pk>', MetaPesoDetailView.as_view(), name='meta-detail'),

    # Archivar una meta
    path('<int:pk>/archivar', ArchivarMetaView.as_view(), name='meta-archivar'),
]
