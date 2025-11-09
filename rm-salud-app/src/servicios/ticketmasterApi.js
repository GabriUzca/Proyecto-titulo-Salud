/**
 * Servicio para integración con Ticketmaster Discovery API
 */

const TICKETMASTER_API_BASE = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;

/**
 * Busca eventos de Ticketmaster por geolocalización
 * @param {number} latitude - Latitud del punto de búsqueda
 * @param {number} longitude - Longitud del punto de búsqueda
 * @param {number} radius - Radio de búsqueda en millas (default: 25)
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
    const url = new URL(`${TICKETMASTER_API_BASE}/events.json`);
    url.searchParams.append('apikey', API_KEY);
    url.searchParams.append('latlong', `${latitude},${longitude}`);
    url.searchParams.append('radius', radius.toString());
    url.searchParams.append('size', size.toString());
    url.searchParams.append('sort', 'date,asc'); // Ordenar por fecha
    url.searchParams.append('unit', 'km'); // Usar kilómetros en lugar de millas

    // Filtro de fechas: desde hoy hasta +diasFuturos días
    if (diasFuturos) {
      const hoy = new Date();
      // Formatear fecha como YYYY-MM-DDTHH:mm:ssZ
      const startDate = hoy.toISOString().split('.')[0] + 'Z';

      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + diasFuturos);
      const endDate = fechaFin.toISOString().split('.')[0] + 'Z';

      url.searchParams.append('startDateTime', startDate);
      url.searchParams.append('endDateTime', endDate);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API Key de Ticketmaster inválida');
      }
      if (response.status === 429) {
        throw new Error('Límite de solicitudes excedido. Intenta nuevamente más tarde.');
      }
      throw new Error(`Error al obtener eventos: ${response.status}`);
    }

    const data = await response.json();

    // Si no hay eventos
    if (!data._embedded || !data._embedded.events) {
      return [];
    }

    // Transformar eventos al formato del mapa
    let eventos = transformarEventos(data._embedded.events);

    // Filtrar por clasificaciones si se especificaron
    if (clasificaciones && clasificaciones.length > 0) {
      const clasificacionesLower = clasificaciones.map(c => c.toLowerCase());
      eventos = eventos.filter(evento => {
        const categoriaLower = evento.categoria.toLowerCase();
        return clasificacionesLower.some(c => categoriaLower.includes(c));
      });
    }

    return eventos;
  } catch (error) {
    console.error('Error en buscarEventosPorUbicacion:', error);
    throw error;
  }
};

/**
 * Transforma eventos de Ticketmaster al formato esperado por MapaRecursos
 * @param {Array} eventos - Array de eventos de Ticketmaster
 * @returns {Array} Array de eventos formateados
 */
const transformarEventos = (eventos) => {
  return eventos.map(evento => {
    // Obtener el primer venue (lugar) del evento
    const venue = evento._embedded?.venues?.[0];

    if (!venue || !venue.location) {
      return null; // Skip eventos sin ubicación
    }

    // Obtener información de precio si está disponible
    const precioInfo = evento.priceRanges?.[0];
    const precioTexto = precioInfo
      ? `${precioInfo.currency} $${precioInfo.min} - $${precioInfo.max}`
      : 'Precio no disponible';

    // Obtener clasificación (género/tipo)
    const clasificacion = evento.classifications?.[0];
    const tipo = clasificacion?.segment?.name || 'Evento';
    const genero = clasificacion?.genre?.name || '';

    // Formatear fecha
    const fechaInicio = evento.dates?.start;
    const fechaTexto = fechaInicio?.localDate
      ? new Date(fechaInicio.localDate).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Fecha por confirmar';

    // Formato de fecha corto para lista (ej: "15 feb")
    const fechaCorta = fechaInicio?.localDate
      ? new Date(fechaInicio.localDate).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        })
      : '';

    const horaTexto = fechaInicio?.localTime || '';
    const fechaISO = fechaInicio?.dateTime || fechaInicio?.localDate || '';

    return {
      id: evento.id,
      titulo: evento.name,
      lugar: venue.name,
      lat: parseFloat(venue.location.latitude),
      lng: parseFloat(venue.location.longitude),
      tipo: 'ticketmaster', // Identificador para diferenciar en el mapa
      categoria: tipo,
      genero: genero,
      fecha: fechaTexto,
      fechaCorta: fechaCorta,
      fechaISO: fechaISO,
      hora: horaTexto,
      precio: precioTexto,
      url: evento.url,
      direccion: venue.address?.line1 || '',
      ciudad: venue.city?.name || '',
      imagen: evento.images?.[0]?.url || null,
      esTicketmaster: true // Identificador para diferenciar de recursos locales
    };
  }).filter(evento => evento !== null); // Filtrar eventos sin ubicación
};

/**
 * Busca eventos por ciudad
 * @param {string} ciudad - Nombre de la ciudad
 * @param {string} codigoPais - Código de país (default: 'CL' para Chile)
 * @param {number} size - Cantidad de eventos (default: 20)
 * @returns {Promise<Array>} Array de eventos formateados
 */
export const buscarEventosPorCiudad = async (ciudad, codigoPais = 'CL', size = 20) => {
  try {
    const url = new URL(`${TICKETMASTER_API_BASE}/events.json`);
    url.searchParams.append('apikey', API_KEY);
    url.searchParams.append('city', ciudad);
    url.searchParams.append('countryCode', codigoPais);
    url.searchParams.append('size', size.toString());
    url.searchParams.append('sort', 'date,asc');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Error al obtener eventos: ${response.status}`);
    }

    const data = await response.json();

    if (!data._embedded || !data._embedded.events) {
      return [];
    }

    return transformarEventos(data._embedded.events);
  } catch (error) {
    console.error('Error en buscarEventosPorCiudad:', error);
    throw error;
  }
};

/**
 * Obtiene detalles de un evento específico
 * @param {string} eventoId - ID del evento
 * @returns {Promise<Object>} Detalles del evento
 */
export const obtenerDetalleEvento = async (eventoId) => {
  try {
    const url = new URL(`${TICKETMASTER_API_BASE}/events/${eventoId}.json`);
    url.searchParams.append('apikey', API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Error al obtener detalle del evento: ${response.status}`);
    }

    const evento = await response.json();
    const eventosTransformados = transformarEventos([evento]);

    return eventosTransformados[0] || null;
  } catch (error) {
    console.error('Error en obtenerDetalleEvento:', error);
    throw error;
  }
};
