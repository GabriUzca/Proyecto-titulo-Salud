from django.urls import path
from .views import RecomendacionesLocalesView

urlpatterns = [
    path("locales/", RecomendacionesLocalesView.as_view(), name="recomendaciones-locales"),
]