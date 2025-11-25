/**
 * Servicio para integración con Ticketmaster Discovery API
 * AHORA usa el backend como proxy para mayor seguridad (no expone API key en frontend)
 */

import axios from "axios";

// Cliente sin autenticación para solicitudes públicas
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

/**
 * Busca eventos de Ticketmaster por geolocalización
 * AHORA hace la petición a través del backend proxy
 * @param {number} latitude - Latitud del punto de búsqueda
 * @param {number} longitude - Longitud del punto de búsqueda
 * @param {number} radius - Radio de búsqueda en kilómetros (default: 25)
 * @param {number} size - Cantidad de eventos a retornar (default: 20, max: 50)
 * @param {Array<string>} clasificaciones - Categorías a buscar: ['sports', 'music', 'arts', 'miscellaneous'] (opcional)
 * @param {number} diasFuturos - Días hacia el futuro para filtrar eventos (default: 90)
 * @returns {Promise<Array>} Array de eventos formateados para el mapa
 */
export const buscarEventosPorUbicacion = async (
  latitude,
  longitude,
  radius = 25,
  size = 20,
  clasificaciones = null,
  diasFuturos = 90
) => {
  try {
    const params = {
      lat: latitude,
      lng: longitude,
      radio: radius,
      size: size,
      dias_futuros: diasFuturos,
    };

    // Agregar categorías si se especificaron
    if (clasificaciones && clasificaciones.length > 0) {
      params.categorias = clasificaciones.join(',');
    }

    const response = await publicApi.get('/api/eventos/ticketmaster/', { params });
    return response.data;
  } catch (error) {
    console.error('Error en buscarEventosPorUbicacion:', error);
    // Extraer mensaje de error del backend si existe
    const errorMsg = error.response?.data?.error || error.message;
    throw new Error(errorMsg);
  }
};

// NOTA: Las funciones buscarEventosPorCiudad y obtenerDetalleEvento fueron removidas
// ya que ahora el backend maneja toda la comunicación con Ticketmaster.
// Si necesitas estas funcionalidades en el futuro, deberás crear endpoints similares en el backend.
