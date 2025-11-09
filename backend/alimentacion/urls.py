from rest_framework.routers import DefaultRouter
from .views import ComidaViewSet

router = DefaultRouter()
router.register(r"", ComidaViewSet, basename="comida")
urlpatterns = router.urls