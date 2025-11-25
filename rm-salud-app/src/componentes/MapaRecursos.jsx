import { useEffect, useMemo, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { buscarEventosPorUbicacion } from "../servicios/ticketmasterApi";
import { buscarEventosAprobados } from "../servicios/eventosApi";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icono personalizado para eventos de Ticketmaster
const EventIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
      <path fill="#E31837" d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"/>
      <circle fill="white" cx="12" cy="9" r="4"/>
      <text x="12" y="11" text-anchor="middle" font-size="8" font-family="Arial" fill="#E31837" font-weight="bold">T</text>
    </svg>
  `),
  shadowUrl,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45],
  shadowSize: [41, 41],
});

// Icono personalizado para eventos aprobados (verde)
const EventoAprobadoIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
      <path fill="#28a745" d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"/>
      <circle fill="white" cx="12" cy="9" r="4"/>
      <text x="12" y="11" text-anchor="middle" font-size="8" font-family="Arial" fill="#28a745" font-weight="bold">E</text>
    </svg>
  `),
  shadowUrl,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45],
  shadowSize: [41, 41],
});

// Función para crear iconos de POIs personalizados
const createPOIIcon = (emoji, color) => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
      <path fill="${color}" d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"/>
      <circle fill="white" cx="12" cy="9" r="4.5"/>
      <text x="12" y="12" text-anchor="middle" font-size="10">${emoji}</text>
    </svg>
  `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString),
    shadowUrl,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -45],
    shadowSize: [41, 41],
  });
};

// Iconos para diferentes tipos de POIs
const POIIcons = {
  gym: createPOIIcon('🏋️', '#6f42c1'),
  sports: createPOIIcon('⚽', '#fd7e14'),
  park: createPOIIcon('🌳', '#20c997'),
  bike: createPOIIcon('🚴', '#17a2b8'),
  market: createPOIIcon('🛒', '#ffc107'),
  supermarket: createPOIIcon('🏪', '#007bff'),
  restaurant: createPOIIcon('🍽️', '#dc3545'),
  bakery: createPOIIcon('🥖', '#e83e8c'),
  shop: createPOIIcon('🏬', '#6c757d'),
  default: createPOIIcon('📍', '#6c757d'),
};

L.Marker.prototype.options.icon = DefaultIcon;

function FitBounds({ puntos }) {
  const map = useMap();

  useEffect(() => {
    if (!puntos?.length) return;
    const bounds = L.latLngBounds(puntos.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [puntos, map]);

  return null;
}

function CenterOnUser({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 13);
    }
  }, [position, map]);

  return null;
}

// Componente para controlar el mapa desde el exterior
function MapController({ mapRef }) {
  const map = useMap();

  useImperativeHandle(mapRef, () => ({
    centerOnLocation: (lat, lng, zoom = 16) => {
      map.setView([lat, lng], zoom);
    }
  }));

  return null;
}

function SearchHereButton({ onSearch, isLoading }) {
  const map = useMap();

  const handleClick = () => {
    const center = map.getCenter();
    onSearch(center.lat, center.lng);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1000,
    }}>
      <button
        onClick={handleClick}
        disabled={isLoading}
        style={{
          padding: '8px 16px',
          background: isLoading ? '#6c757d' : '#E31837',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 'bold',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {isLoading ? '🔄 Buscando...' : '🔍 Buscar eventos aquí'}
      </button>
    </div>
  );
}

const MapaRecursos = forwardRef(({ recursos, pois = [], alto = 260, mostrarEventos = true, radioKm = 40, onEventosActualizados, onUbicacionActualizada }, ref) => {
  const [posUsuario, setPosUsuario] = useState(null);
  const [eventosTicketmaster, setEventosTicketmaster] = useState([]);
  const [eventosAprobados, setEventosAprobados] = useState([]);
  const [cargandoEventos, setCargandoEventos] = useState(false);
  const [errorEventos, setErrorEventos] = useState(null);
  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [filtros, setFiltros] = useState({
    ticketmaster: true,
    locales: true,
    recursos: true,
    // POIs segmentados por tipo
    gym: true,
    sports: true,
    park: true,
    bike: true,
    market: true,
    supermarket: true,
    restaurant: true,
    bakery: true,
    shop: true
  });
  const mapControllerRef = useRef();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPosUsuario({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    );
  }, []);

  // Función para cargar eventos por coordenadas
  const cargarEventosPorCoordenadas = async (lat, lng) => {
    if (!mostrarEventos) return;

    setCargandoEventos(true);
    setErrorEventos(null);
    try {
      // Cargar eventos de Ticketmaster
      const categorias = ['sports', 'music', 'arts', 'miscellaneous'];
      const eventosTicket = await buscarEventosPorUbicacion(
        lat,
        lng,
        radioKm,
        20, // Máximo 20 eventos
        categorias, // Categorías a buscar
        90 // Próximos 90 días
      );
      setEventosTicketmaster(eventosTicket);

      // Cargar eventos aprobados
      const eventosLocal = await buscarEventosAprobados(
        lat,
        lng,
        radioKm,
        90 // Próximos 90 días
      );
      setEventosAprobados(eventosLocal);

      // Notificar al componente padre si se proporciona el callback
      const todosLosEventos = [...eventosTicket, ...eventosLocal];
      if (onEventosActualizados) {
        onEventosActualizados(todosLosEventos);
      }

      // Actualizar la ubicación de referencia para filtrar recursos cercanos
      if (onUbicacionActualizada) {
        onUbicacionActualizada({ lat, lng });
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setErrorEventos(error.message);
    } finally {
      setCargandoEventos(false);
    }
  };

  // Cargar eventos de Ticketmaster cuando se obtiene la ubicación del usuario
  useEffect(() => {
    if (!posUsuario || !mostrarEventos) return;
    cargarEventosPorCoordenadas(posUsuario.lat, posUsuario.lng);
  }, [posUsuario, mostrarEventos, radioKm]);

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    centerOnLocation: (lat, lng, zoom = 16) => {
      if (mapControllerRef.current) {
        mapControllerRef.current.centerOnLocation(lat, lng, zoom);
      }
    }
  }));

  // Función para cambiar filtros
  const toggleFiltro = (key) => {
    setFiltros(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Seleccionar todos los filtros
  const seleccionarTodos = () => {
    setFiltros({
      ticketmaster: true,
      locales: true,
      recursos: true,
      gym: true,
      sports: true,
      park: true,
      bike: true,
      market: true,
      supermarket: true,
      restaurant: true,
      bakery: true,
      shop: true
    });
  };

  // Deseleccionar todos los filtros
  const deseleccionarTodos = () => {
    setFiltros({
      ticketmaster: false,
      locales: false,
      recursos: false,
      gym: false,
      sports: false,
      park: false,
      bike: false,
      market: false,
      supermarket: false,
      restaurant: false,
      bakery: false,
      shop: false
    });
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filtrosVisible && !e.target.closest('.filtros-container')) {
        setFiltrosVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filtrosVisible]);

  const puntos = useMemo(() => {
    const base = (recursos || []).filter(r => typeof r.lat === "number" && typeof r.lng === "number");
    const eventosTicket = (eventosTicketmaster || []).filter(e => typeof e.lat === "number" && typeof e.lng === "number");

    // Convertir strings a números para eventos aprobados (compatible con backend)
    const eventosLocal = (eventosAprobados || [])
      .filter(e => e.latitud != null && e.longitud != null)
      .map(e => ({
        lat: typeof e.latitud === 'string' ? parseFloat(e.latitud) : e.latitud,
        lng: typeof e.longitud === 'string' ? parseFloat(e.longitud) : e.longitud
      }))
      .filter(e => !isNaN(e.lat) && !isNaN(e.lng));

    // POIs personalizados
    const poisValidos = (pois || []).filter(p => typeof p.lat === "number" && typeof p.lng === "number");

    const todos = [...base, ...eventosTicket, ...eventosLocal, ...poisValidos];
    return posUsuario ? [...todos, { lat: posUsuario.lat, lng: posUsuario.lng, __yo: true }] : todos;
  }, [recursos, eventosTicketmaster, eventosAprobados, pois, posUsuario]);

  // Centro inicial: ubicación del usuario si existe, sino Santiago
  const center = posUsuario
    ? [posUsuario.lat, posUsuario.lng]
    : [-33.4489, -70.6693];

  // Calcular totales visibles según filtros
  const poisVisibles = pois.filter(poi => {
    const iconoKey = poi.icono || 'default';
    return filtros[iconoKey] === true;
  });

  const totalesVisibles = {
    pois: poisVisibles.length,
    ticketmaster: filtros.ticketmaster ? eventosTicketmaster.length : 0,
    locales: filtros.locales ? eventosAprobados.length : 0,
    recursos: filtros.recursos ? recursos.length : 0
  };
  const totalVisible = Object.values(totalesVisibles).reduce((a, b) => a + b, 0);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Información de estado */}
      {mostrarEventos && (
        <div style={{
          marginBottom: 8,
          padding: "8px 12px",
          background: "#f8f9fa",
          borderRadius: 6,
          fontSize: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>
            {cargandoEventos && "🔄 Cargando eventos..."}
            {!cargandoEventos && totalVisible > 0 && `🎫 ${totalVisible} lugares encontrados`}
            {!cargandoEventos && totalVisible === 0 && !errorEventos && "📍 No hay lugares cerca"}
            {errorEventos && `⚠️ ${errorEventos}`}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {totalVisible > 0 && (
              <span style={{ fontSize: 12, color: "#6c757d" }}>
                Radio: {radioKm} km
              </span>
            )}
            {/* Botón de filtros */}
            <div className="filtros-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setFiltrosVisible(!filtrosVisible)}
                style={{
                  padding: '4px 10px',
                  background: filtrosVisible ? '#6f42c1' : 'white',
                  color: filtrosVisible ? 'white' : '#6c757d',
                  border: '1px solid #dee2e6',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                🔽 Filtros
              </button>

              {/* Dropdown de filtros */}
              {filtrosVisible && (
                <div style={{
                  position: 'fixed',
                  top: 'auto',
                  right: '10px',
                  bottom: '20px',
                  background: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: 6,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  padding: 12,
                  minWidth: 260,
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  zIndex: 1001
                }}>
                  {/* Título y botones de control */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: '#495057' }}>
                      Mostrar en mapa:
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={seleccionarTodos}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Todos
                      </button>
                      <button
                        onClick={deseleccionarTodos}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        ✗ Ninguno
                      </button>
                    </div>
                  </div>

                  {/* Separador */}
                  <div style={{ borderTop: '1px solid #dee2e6', marginBottom: 8 }}></div>

                  {/* POIs Personalizados - Actividades Físicas */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#6c757d', marginBottom: 4, textTransform: 'uppercase' }}>
                      Actividades Físicas
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filtros.gym}
                        onChange={() => toggleFiltro('gym')}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#495057' }}>
                        🏋️ Gimnasios ({pois.filter(p => p.icono === 'gym').length})
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filtros.sports}
                        onChange={() => toggleFiltro('sports')}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#495057' }}>
                        ⚽ Centros deportivos ({pois.filter(p => p.icono === 'sports').length})
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filtros.park}
                        onChange={() => toggleFiltro('park')}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#495057' }}>
                        🌳 Parques ({pois.filter(p => p.icono === 'park').length})
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filtros.bike}
                        onChange={() => toggleFiltro('bike')}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#495057' }}>
                        🚴 Ciclovías ({pois.filter(p => p.icono === 'bike').length})
                      </span>
                    </label>
                  </div>

                  {/* POIs Personalizados - Alimentación */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#6c757d', marginBottom: 4, textTransform: 'uppercase' }}>
                      Alimentación
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filtros.market}
                        onChange={() => toggleFiltro('market')}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#495057' }}>
                        🛒 Ferias ({pois.filter(p => p.icono === 'market').length})
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filtros.supermarket}
                        onChange={() => toggleFiltro('supermarket')}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#495057' }}>
                        🏪 Supermercados ({pois.filter(p => p.icono === 'supermarket').length})
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filtros.restaurant}
                        onChange={() => toggleFiltro('restaurant')}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#495057' }}>
                        🍽️ Restaurantes ({pois.filter(p => p.icono === 'restaurant').length})
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filtros.bakery}
                        onChange={() => toggleFiltro('bakery')}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#495057' }}>
                        🥖 Panaderías ({pois.filter(p => p.icono === 'bakery').length})
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={filtros.shop}
                        onChange={() => toggleFiltro('shop')}
                        style={{ marginRight: 8, cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12, color: '#495057' }}>
                        🏬 Tiendas ({pois.filter(p => p.icono === 'shop').length})
                      </span>
                    </label>
                  </div>

                  {/* Separador */}
                  <div style={{ borderTop: '1px solid #dee2e6', marginY: 8 }}></div>

                  {/* Otros filtros */}
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#6c757d', marginBottom: 4, marginTop: 8, textTransform: 'uppercase' }}>
                    Eventos y Recursos
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filtros.ticketmaster}
                      onChange={() => toggleFiltro('ticketmaster')}
                      style={{ marginRight: 8, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 12, color: '#495057' }}>
                      🎫 Eventos Ticketmaster ({eventosTicketmaster.length})
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filtros.locales}
                      onChange={() => toggleFiltro('locales')}
                      style={{ marginRight: 8, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 12, color: '#495057' }}>
                      🎉 Eventos Locales ({eventosAprobados.length})
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filtros.recursos}
                      onChange={() => toggleFiltro('recursos')}
                      style={{ marginRight: 8, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 12, color: '#495057' }}>
                      📍 Recursos Locales ({recursos.length})
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div style={{ width: "100%", height: alto, borderRadius: 8, overflow: "hidden", background: "#e9ecef" }}>
        <MapContainer center={center} zoom={13} style={{ width: "100%", height: "100%" }}>
          <MapController mapRef={mapControllerRef} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcadores de recursos originales */}
          {filtros.recursos && recursos?.map((r, i) => (
            (typeof r.lat === "number" && typeof r.lng === "number") && (
              <Marker key={`recurso-${i}`} position={[r.lat, r.lng]} icon={DefaultIcon}>
                <Popup>
                  <strong>{r.titulo}</strong><br />
                  {r.lugar}
                  {r.tipo && <><br /><em>{r.tipo}</em></>}
                </Popup>
              </Marker>
            )
          ))}

          {/* Marcadores de eventos de Ticketmaster */}
          {filtros.ticketmaster && eventosTicketmaster?.map((evento, i) => (
            (typeof evento.lat === "number" && typeof evento.lng === "number") && (
              <Marker key={`evento-${evento.id}-${i}`} position={[evento.lat, evento.lng]} icon={EventIcon}>
                <Popup maxWidth={300}>
                  <div style={{ minWidth: 200 }}>
                    <strong style={{ fontSize: 16, color: "#E31837" }}>🎫 {evento.titulo}</strong><br />
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      <strong>📍 Lugar:</strong> {evento.lugar}<br />
                      {evento.direccion && <><strong>📮 Dirección:</strong> {evento.direccion}<br /></>}
                      {evento.ciudad && <><strong>🏙️ Ciudad:</strong> {evento.ciudad}<br /></>}
                      <strong>📅 Fecha:</strong> {evento.fecha}<br />
                      {evento.hora && <><strong>🕐 Hora:</strong> {evento.hora}<br /></>}
                      {evento.categoria && <><strong>🎭 Categoría:</strong> {evento.categoria}<br /></>}
                      {evento.genero && <><strong>🎵 Género:</strong> {evento.genero}<br /></>}
                      <strong>💰 Precio:</strong> {evento.precio}<br />
                      {evento.url && (
                        <a
                          href={evento.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: 8,
                            padding: "6px 12px",
                            background: "#E31837",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: "bold"
                          }}
                        >
                          Ver en Ticketmaster →
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}

          {/* Marcadores de eventos aprobados locales */}
          {filtros.locales && eventosAprobados?.map((evento, i) => {
            // Convertir strings a números si es necesario (compatibilidad con backend)
            const lat = typeof evento.latitud === 'string' ? parseFloat(evento.latitud) : evento.latitud;
            const lng = typeof evento.longitud === 'string' ? parseFloat(evento.longitud) : evento.longitud;

            return (lat && lng && !isNaN(lat) && !isNaN(lng)) && (
              <Marker key={`evento-aprobado-${evento.id}-${i}`} position={[lat, lng]} icon={EventoAprobadoIcon}>
                <Popup maxWidth={300}>
                  <div style={{ minWidth: 200 }}>
                    <strong style={{ fontSize: 16, color: "#28a745" }}>🎉 {evento.nombre_evento}</strong><br />
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      {evento.descripcion && <><strong>📝 Descripción:</strong> {evento.descripcion}<br /></>}
                      <strong>📅 Fecha inicio:</strong> {new Date(evento.fecha_inicio).toLocaleDateString('es-CL')}<br />
                      {evento.fecha_fin && <><strong>📅 Fecha fin:</strong> {new Date(evento.fecha_fin).toLocaleDateString('es-CL')}<br /></>}
                      {evento.categoria && <><strong>🎭 Categoría:</strong> {evento.categoria}<br /></>}
                      <strong>💰 Entrada:</strong> {evento.tipo_entrada === 'gratuito' ? 'Gratuita' : `${evento.precio || 'Consultar precio'}`}<br />
                      {evento.direccion && <><strong>📮 Dirección:</strong> {evento.direccion}<br /></>}
                      {evento.ciudad && <><strong>🏙️ Ciudad:</strong> {evento.ciudad}<br /></>}
                      {evento.nombre_empresa && <><strong>🏢 Organiza:</strong> {evento.nombre_empresa}<br /></>}
                      {evento.nombre_contacto && <><strong>👤 Contacto:</strong> {evento.nombre_contacto}<br /></>}
                      {evento.telefono_contacto && <><strong>📞 Teléfono:</strong> {evento.telefono_contacto}<br /></>}
                      {evento.email_contacto && <><strong>📧 Email:</strong> {evento.email_contacto}<br /></>}
                      {evento.url_evento && (
                        <a
                          href={evento.url_evento}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: 8,
                            padding: "6px 12px",
                            background: "#28a745",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: "bold"
                          }}
                        >
                          Más información →
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Marcadores de POIs personalizados */}
          {pois?.map((poi, i) => {
            if (typeof poi.lat !== "number" || typeof poi.lng !== "number") return null;

            // Filtrar por tipo de icono específico
            const iconoKey = poi.icono || 'default';
            if (!filtros[iconoKey]) return null;

            const icon = POIIcons[poi.icono] || POIIcons.default;

            return (
              <Marker key={`poi-${poi.id}-${i}`} position={[poi.lat, poi.lng]} icon={icon}>
                <Popup maxWidth={300}>
                  <div style={{ minWidth: 200 }}>
                    <strong style={{ fontSize: 16, color: '#333' }}>{poi.nombre}</strong><br />
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      {poi.tipo && <><strong>📋 Tipo:</strong> {poi.tipo}<br /></>}
                      {poi.direccion && <><strong>📮 Dirección:</strong> {poi.direccion}<br /></>}
                      {poi.prioridad && <><strong>⭐ Prioridad:</strong> {poi.prioridad}/10<br /></>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Marcador de ubicación del usuario */}
          {posUsuario && (
            <Marker position={[posUsuario.lat, posUsuario.lng]} icon={DefaultIcon}>
              <Popup>📍 Estás aquí</Popup>
            </Marker>
          )}

          {/* Centrar mapa en ubicación del usuario cuando se obtenga */}
          <CenterOnUser position={posUsuario} />

          {/* Botón para buscar eventos en la ubicación actual del mapa */}
          {mostrarEventos && <SearchHereButton onSearch={cargarEventosPorCoordenadas} isLoading={cargandoEventos} />}
        </MapContainer>
      </div>
    </div>
  );
});

MapaRecursos.displayName = 'MapaRecursos';

export default MapaRecursos;