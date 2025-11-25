from django.urls import path
from .views import RecomendacionesLocalesView, POIRecommendationsView

urlpatterns = [
    path("locales/", RecomendacionesLocalesView.as_view(), name="recomendaciones-locales"),
    path("poi/", POIRecommendationsView.as_view(), name="poi-recommendations"),
]