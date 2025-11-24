from datetime import date, timedelta
import requests
import logging

logger = logging.getLogger(__name__)

# Datos mock de recursos locales en la RM
DATA = [
    {
        "titulo": "Parque Bicentenario",
        "lugar": "Vitacura",
        "lat": -33.4006,
        "lng": -70.6075,
        "fecha": 1,
        "tipo": "parque"
    },
    {
        "titulo": "Ciclovía Providencia",
        "lugar": "Providencia",
        "lat": -33.4251,
        "lng": -70.6159,
        "fecha": 3,
        "tipo": "ciclovia"
    },
    {
        "titulo": "Feria Saludable Las Condes",
        "lugar": "Las Condes",
        "lat": -33.4172,
        "lng": -70.5926,
        "fecha": 7,
        "tipo": "feria"
    },
    {
        "titulo": "Gimnasio Municipal Ñuñoa",
        "lugar": "Ñuñoa",
        "lat": -33.4569,
        "lng": -70.5970,
        "fecha": 0,
        "tipo": "gimnasio"
    },
]

def recomendaciones_locales(comuna="Santiago"):
    """
    Retorna recomendaciones de recursos locales en la RM.
    En el futuro, esto podría filtrarse por comuna o integrar APIs externas.
    """
    hoy = date.today()
    items = []

    for it in DATA:
        items.append({
            "titulo": it["titulo"],
            "lugar": it["lugar"],
            "lat": it["lat"],
            "lng": it["lng"],
            "fecha": str(hoy + timedelta(days=it["fecha"])),
            "tipo": it.get("tipo", "otro")
        })

    return items


def consultar_overpass_api(lat, lng, radius, queries):
    """
    Consulta la API de Overpass para obtener POIs de OpenStreetMap.

    Args:
        lat: Latitud del centro de búsqueda
        lng: Longitud del centro de búsqueda
        radius: Radio de búsqueda en metros
        queries: Lista de queries Overpass QL

    Returns:
        Lista de elementos encontrados
    """
    overpass_url = "https://overpass-api.de/api/interpreter"

    # Construir la query combinada
    query_parts = []
    for q in queries:
        query_parts.append(q)

    overpass_query = f"""
    [out:json][timeout:25];
    (
      {';'.join(query_parts)};
    );
    out body;
    >;
    out skel qt;
    """

    try:
        response = requests.post(
            overpass_url,
            data={'data': overpass_query},
            timeout=30
        )
        response.raise_for_status()
        return response.json().get('elements', [])
    except requests.exceptions.RequestException as e:
        logger.error(f"Error consultando Overpass API: {e}")
        return []


def get_poi_recommendations(user, lat, lng, radius_km=5):
    """
    Genera recomendaciones de POIs personalizadas basadas en las metas del usuario.

    Args:
        user: Usuario autenticado
        lat: Latitud de búsqueda
        lng: Longitud de búsqueda
        radius_km: Radio de búsqueda en kilómetros (default: 5)

    Returns:
        Lista de POIs recomendados con información detallada
    """
    from metas.models import MetaPeso

    # Obtener la meta activa del usuario (la más reciente que esté activa)
    try:
        meta = MetaPeso.objects.filter(user=user, activo=True).order_by('-created_at').first()
        if not meta:
            return {
                'error': 'No se encontró una meta de peso activa',
                'pois': [],
                'total': 0
            }

        tipo_meta = meta.tipo_meta  # 'perdida', 'ganancia', 'mantenimiento'
        nivel_actividad = meta.nivel_actividad

    except Exception as e:
        logger.error(f"Error obteniendo meta del usuario: {e}")
        return {
            'error': 'Error al obtener información del usuario',
            'pois': []
        }

    radius_m = radius_km * 1000
    queries = []
    poi_config = {}

    # Configurar queries según el tipo de meta
    if tipo_meta == 'perdida':
        # Para bajar de peso: gimnasios, parques, ciclovías, centros deportivos
        queries = [
            f'node["leisure"="fitness_centre"](around:{radius_m},{lat},{lng})',
            f'node["leisure"="sports_centre"](around:{radius_m},{lat},{lng})',
            f'node["leisure"="park"](around:{radius_m},{lat},{lng})',
            f'way["highway"="cycleway"](around:{radius_m},{lat},{lng})',
            f'node["sport"="fitness"](around:{radius_m},{lat},{lng})',
        ]
        poi_config = {
            'fitness_centre': {'tipo': 'gimnasio', 'prioridad': 10, 'icono': 'gym'},
            'sports_centre': {'tipo': 'centro_deportivo', 'prioridad': 9, 'icono': 'sports'},
            'park': {'tipo': 'parque', 'prioridad': 7, 'icono': 'park'},
            'cycleway': {'tipo': 'ciclovia', 'prioridad': 8, 'icono': 'bike'},
        }

    elif tipo_meta == 'ganancia':
        # Para subir de peso: ferias, mercados, supermercados, restaurantes, patios de comida
        queries = [
            f'node["amenity"="marketplace"](around:{radius_m},{lat},{lng})',
            f'node["shop"="supermarket"](around:{radius_m},{lat},{lng})',
            f'node["amenity"="restaurant"](around:{radius_m},{lat},{lng})',
            f'node["amenity"="food_court"](around:{radius_m},{lat},{lng})',
            f'node["shop"="bakery"](around:{radius_m},{lat},{lng})',
            f'node["shop"="convenience"](around:{radius_m},{lat},{lng})',
        ]
        poi_config = {
            'marketplace': {'tipo': 'feria', 'prioridad': 10, 'icono': 'market'},
            'supermarket': {'tipo': 'supermercado', 'prioridad': 9, 'icono': 'supermarket'},
            'restaurant': {'tipo': 'restaurante', 'prioridad': 8, 'icono': 'restaurant'},
            'food_court': {'tipo': 'patio_comidas', 'prioridad': 8, 'icono': 'restaurant'},
            'bakery': {'tipo': 'panaderia', 'prioridad': 7, 'icono': 'bakery'},
            'convenience': {'tipo': 'tienda', 'prioridad': 6, 'icono': 'shop'},
        }

    else:  # mantenimiento
        # Balance: parques, mercados, gimnasios
        queries = [
            f'node["leisure"="park"](around:{radius_m},{lat},{lng})',
            f'node["leisure"="fitness_centre"](around:{radius_m},{lat},{lng})',
            f'node["amenity"="marketplace"](around:{radius_m},{lat},{lng})',
            f'node["shop"="supermarket"](around:{radius_m},{lat},{lng})',
        ]
        poi_config = {
            'park': {'tipo': 'parque', 'prioridad': 8, 'icono': 'park'},
            'fitness_centre': {'tipo': 'gimnasio', 'prioridad': 8, 'icono': 'gym'},
            'marketplace': {'tipo': 'feria', 'prioridad': 7, 'icono': 'market'},
            'supermarket': {'tipo': 'supermercado', 'prioridad': 7, 'icono': 'supermarket'},
        }

    # Ajustar prioridades según nivel de actividad
    if nivel_actividad == 'sedentario' and tipo_meta == 'perdida':
        # Priorizar lugares más accesibles para principiantes
        if 'park' in poi_config:
            poi_config['park']['prioridad'] += 2
    elif nivel_actividad in ['activo', 'muy_activo']:
        # Priorizar instalaciones deportivas más intensas
        if 'sports_centre' in poi_config:
            poi_config['sports_centre']['prioridad'] += 2

    # Consultar Overpass API
    elements = consultar_overpass_api(lat, lng, radius_m, queries)

    # DEBUG: Ver qué devuelve Overpass
    print(f"\n=== DEBUG OVERPASS API ===")
    print(f"Total elementos recibidos: {len(elements)}")
    print(f"Tipo de meta: {tipo_meta}")
    print(f"POI config keys: {list(poi_config.keys())}")

    # Procesar y formatear resultados
    pois = []
    for element in elements:
        if element.get('type') not in ['node', 'way']:
            continue

        tags = element.get('tags', {})

        # Obtener coordenadas
        if element.get('type') == 'node':
            poi_lat = element.get('lat')
            poi_lng = element.get('lon')
        elif element.get('type') == 'way':
            # Para ways, usar el centro aproximado
            poi_lat = element.get('center', {}).get('lat') or element.get('lat')
            poi_lng = element.get('center', {}).get('lon') or element.get('lon')
        else:
            continue

        if not poi_lat or not poi_lng:
            continue

        # Determinar tipo de POI basado en tags específicos
        config = None

        # DEBUG: Ver tags de cada elemento
        nombre_debug = tags.get('name', 'Sin nombre')
        print(f"\nProcesando: {nombre_debug}")
        print(f"  Tags: {tags}")

        # Priorizar amenity (restaurantes, ferias, patios de comida)
        if 'amenity' in tags:
            amenity_type = tags['amenity']
            print(f"  Tiene amenity={amenity_type}, en poi_config? {amenity_type in poi_config}")
            if amenity_type in poi_config:
                config = poi_config[amenity_type]
                print(f"  ✓ Matcheó como amenity: {amenity_type}")

        # Luego shop (supermercados, panaderías, tiendas)
        if not config and 'shop' in tags:
            shop_type = tags['shop']
            print(f"  Tiene shop={shop_type}, en poi_config? {shop_type in poi_config}")
            if shop_type in poi_config:
                config = poi_config[shop_type]
                print(f"  ✓ Matcheó como shop: {shop_type}")

        # Luego leisure (gimnasios, parques, centros deportivos)
        if not config and 'leisure' in tags:
            leisure_type = tags['leisure']
            print(f"  Tiene leisure={leisure_type}, en poi_config? {leisure_type in poi_config}")
            if leisure_type in poi_config:
                config = poi_config[leisure_type]
                print(f"  ✓ Matcheó como leisure: {leisure_type}")

        # Finalmente highway (ciclovías)
        if not config and 'highway' in tags:
            highway_type = tags['highway']
            print(f"  Tiene highway={highway_type}, en poi_config? {highway_type in poi_config}")
            if highway_type in poi_config:
                config = poi_config[highway_type]
                print(f"  ✓ Matcheó como highway: {highway_type}")

        if not config:
            print(f"  ✗ NO matcheó - descartado")
            continue

        print(f"  ✓ AGREGADO como {config['tipo']}")

        # Obtener nombre
        nombre = tags.get('name', 'Sin nombre')
        direccion = tags.get('addr:street', '')

        pois.append({
            'id': element.get('id'),
            'nombre': nombre,
            'tipo': config['tipo'],
            'icono': config['icono'],
            'prioridad': config['prioridad'],
            'lat': poi_lat,
            'lng': poi_lng,
            'direccion': direccion,
            'tags': tags
        })

    # Ordenar por prioridad
    pois.sort(key=lambda x: x['prioridad'], reverse=True)

    # DEBUG: Resumen final
    print(f"\n=== RESUMEN FINAL ===")
    print(f"Total POIs agregados: {len(pois)}")
    tipos_count = {}
    for poi in pois:
        tipo = poi['tipo']
        tipos_count[tipo] = tipos_count.get(tipo, 0) + 1
    print(f"Por tipo: {tipos_count}")
    print(f"========================\n")

    return {
        'tipo_meta': tipo_meta,
        'nivel_actividad': nivel_actividad,
        'total': len(pois),
        'pois': pois[:50]  # Limitar a 50 resultados
    }