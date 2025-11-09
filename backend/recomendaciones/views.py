from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import recomendaciones_locales

class RecomendacionesLocalesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        comuna = request.query_params.get("comuna", "Santiago")
        data = recomendaciones_locales(comuna)
        return Response({
            "comuna": comuna,
            "total": len(data),
            "items": data
        })