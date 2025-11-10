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

const MapaRecursos = forwardRef(({ recursos, alto = 260, mostrarEventos = true, radioKm = 40, onEventosActualizados, onUbicacionActualizada }, ref) => {
  const [posUsuario, setPosUsuario] = useState(null);
  const [eventosTicketmaster, setEventosTicketmaster] = useState([]);
  const [eventosAprobados, setEventosAprobados] = useState([]);
  const [cargandoEventos, setCargandoEventos] = useState(false);
  const [errorEventos, setErrorEventos] = useState(null);
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

  const puntos = useMemo(() => {
    const base = (recursos || []).filter(r => typeof r.lat === "number" && typeof r.lng === "number");
    const eventosTicket = (eventosTicketmaster || []).filter(e => typeof e.lat === "number" && typeof e.lng === "number");
    const eventosLocal = (eventosAprobados || []).filter(e => typeof e.latitud === "number" && typeof e.longitud === "number");
    const todos = [...base, ...eventosTicket, ...eventosLocal.map(e => ({ lat: e.latitud, lng: e.longitud }))];
    return posUsuario ? [...todos, { lat: posUsuario.lat, lng: posUsuario.lng, __yo: true }] : todos;
  }, [recursos, eventosTicketmaster, eventosAprobados, posUsuario]);

  // Centro inicial: ubicación del usuario si existe, sino Santiago
  const center = posUsuario
    ? [posUsuario.lat, posUsuario.lng]
    : [-33.4489, -70.6693];

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
            {!cargandoEventos && (eventosTicketmaster.length > 0 || eventosAprobados.length > 0 || recursos.length > 0) && `🎫 ${eventosTicketmaster.length + eventosAprobados.length + recursos.length} eventos encontrados`}
            {!cargandoEventos && eventosTicketmaster.length === 0 && eventosAprobados.length === 0 && recursos.length === 0 && !errorEventos && "📍 No hay eventos cerca"}
            {errorEventos && `⚠️ ${errorEventos}`}
          </span>
          {(eventosTicketmaster.length > 0 || eventosAprobados.length > 0 || recursos.length > 0) && (
            <span style={{ fontSize: 12, color: "#6c757d" }}>
              Radio: {radioKm} km
            </span>
          )}
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
          {recursos?.map((r, i) => (
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
          {eventosTicketmaster?.map((evento, i) => (
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
          {eventosAprobados?.map((evento, i) => (
            (typeof evento.latitud === "number" && typeof evento.longitud === "number") && (
              <Marker key={`evento-aprobado-${evento.id}-${i}`} position={[evento.latitud, evento.longitud]} icon={EventoAprobadoIcon}>
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
            )
          ))}

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