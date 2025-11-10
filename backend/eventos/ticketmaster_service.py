"""
Servicio para integración con Ticketmaster Discovery API
"""
import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional


TICKETMASTER_API_BASE = 'https://app.ticketmaster.com/discovery/v2'


def get_api_key():
    """Obtiene la API key desde variables de entorno"""
    api_key = os.environ.get('TICKETMASTER_API_KEY')
    if not api_key:
        raise ValueError('TICKETMASTER_API_KEY no está configurada en las variables de entorno')
    return api_key


def buscar_eventos_por_ubicacion(
    latitude: float,
    longitude: float,
    radius: int = 25,
    size: int = 20,
    clasificaciones: Optional[List[str]] = None,
    dias_futuros: int = 90
) -> List[Dict]:
    """
    Busca eventos de Ticketmaster por geolocalización

    Args:
        latitude: Latitud del punto de búsqueda
        longitude: Longitud del punto de búsqueda
        radius: Radio de búsqueda en kilómetros (default: 25)
        size: Cantidad de eventos a retornar (default: 20, max: 50)
        clasificaciones: Categorías a buscar ['sports', 'music', 'arts', 'miscellaneous']
        dias_futuros: Días hacia el futuro para filtrar eventos (default: 90)

    Returns:
        Array de eventos formateados
    """
    try:
        api_key = get_api_key()

        params = {
            'apikey': api_key,
            'latlong': f'{latitude},{longitude}',
            'radius': str(radius),
            'size': str(size),
            'sort': 'date,asc',
            'unit': 'km'
        }

        # Filtro de fechas
        if dias_futuros:
            hoy = datetime.now()
            start_date = hoy.strftime('%Y-%m-%dT%H:%M:%SZ')

            fecha_fin = hoy + timedelta(days=dias_futuros)
            end_date = fecha_fin.strftime('%Y-%m-%dT%H:%M:%SZ')

            params['startDateTime'] = start_date
            params['endDateTime'] = end_date

        response = requests.get(
            f'{TICKETMASTER_API_BASE}/events.json',
            params=params,
            timeout=10
        )

        if response.status_code == 401:
            raise Exception('API Key de Ticketmaster inválida')
        elif response.status_code == 429:
            raise Exception('Límite de solicitudes excedido')
        elif not response.ok:
            raise Exception(f'Error al obtener eventos: {response.status_code}')

        data = response.json()

        # Si no hay eventos
        if not data.get('_embedded') or not data['_embedded'].get('events'):
            return []

        # Transformar eventos
        eventos = transformar_eventos(data['_embedded']['events'])

        # Filtrar por clasificaciones si se especificaron
        if clasificaciones:
            clasificaciones_lower = [c.lower() for c in clasificaciones]
            eventos = [
                evento for evento in eventos
                if any(c in evento['categoria'].lower() for c in clasificaciones_lower)
            ]

        return eventos

    except requests.RequestException as e:
        raise Exception(f'Error de conexión con Ticketmaster: {str(e)}')
    except Exception as e:
        raise Exception(f'Error al buscar eventos: {str(e)}')


def transformar_eventos(eventos: List[Dict]) -> List[Dict]:
    """
    Transforma eventos de Ticketmaster al formato esperado por el frontend

    Args:
        eventos: Array de eventos de Ticketmaster

    Returns:
        Array de eventos formateados
    """
    eventos_transformados = []

    for evento in eventos:
        # Obtener venue (lugar)
        venue = evento.get('_embedded', {}).get('venues', [{}])[0]

        if not venue or not venue.get('location'):
            continue  # Skip eventos sin ubicación

        # Obtener información de precio
        precio_info = evento.get('priceRanges', [{}])[0]
        if precio_info:
            precio_texto = f"{precio_info.get('currency', '')} ${precio_info.get('min', 0)} - ${precio_info.get('max', 0)}"
        else:
            precio_texto = 'Precio no disponible'

        # Obtener clasificación
        clasificacion = evento.get('classifications', [{}])[0]
        tipo = clasificacion.get('segment', {}).get('name', 'Evento')
        genero = clasificacion.get('genre', {}).get('name', '')

        # Formatear fechas
        fecha_inicio = evento.get('dates', {}).get('start', {})
        fecha_local = fecha_inicio.get('localDate')

        if fecha_local:
            fecha_obj = datetime.strptime(fecha_local, '%Y-%m-%d')
            fecha_texto = fecha_obj.strftime('%d de %B de %Y')
            fecha_corta = fecha_obj.strftime('%d %b')
        else:
            fecha_texto = 'Fecha por confirmar'
            fecha_corta = ''

        hora_texto = fecha_inicio.get('localTime', '')
        fecha_iso = fecha_inicio.get('dateTime', fecha_inicio.get('localDate', ''))

        # Obtener coordenadas
        try:
            lat = float(venue['location']['latitude'])
            lng = float(venue['location']['longitude'])
        except (KeyError, ValueError, TypeError):
            continue  # Skip si no hay coordenadas válidas

        eventos_transformados.append({
            'id': evento['id'],
            'titulo': evento['name'],
            'lugar': venue.get('name', ''),
            'lat': lat,
            'lng': lng,
            'tipo': 'ticketmaster',
            'categoria': tipo,
            'genero': genero,
            'fecha': fecha_texto,
            'fechaCorta': fecha_corta,
            'fechaISO': fecha_iso,
            'hora': hora_texto,
            'precio': precio_texto,
            'url': evento.get('url', ''),
            'direccion': venue.get('address', {}).get('line1', ''),
            'ciudad': venue.get('city', {}).get('name', ''),
            'imagen': evento.get('images', [{}])[0].get('url'),
            'esTicketmaster': True
        })

    return eventos_transformados
