from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services import recomendaciones_locales, get_poi_recommendations

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


class POIRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Endpoint para obtener recomendaciones de POIs personalizadas.

        Query params:
            - lat: Latitud (requerido)
            - lng: Longitud (requerido)
            - radius_km: Radio de búsqueda en kilómetros (opcional, default=5)
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius_km = request.query_params.get('radius_km', 5)

        if not lat or not lng:
            return Response(
                {'error': 'Se requieren parámetros lat y lng'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            lat = float(lat)
            lng = float(lng)
            radius_km = float(radius_km)

            if radius_km <= 0 or radius_km > 50:
                return Response(
                    {'error': 'El radio debe estar entre 0 y 50 km'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except ValueError:
            return Response(
                {'error': 'Los parámetros lat, lng y radius_km deben ser números válidos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = get_poi_recommendations(
            user=request.user,
            lat=lat,
            lng=lng,
            radius_km=radius_km
        )

        if 'error' in result and result['total'] == 0:
            return Response(result, status=status.HTTP_404_NOT_FOUND)

        return Response(result)