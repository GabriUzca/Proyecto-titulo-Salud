import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { crearSolicitudEvento } from '../servicios/eventosApi';
import BotonAccion from '../componentes/comunes/BotonAccion';
import CampoEntrada from '../componentes/comunes/CampoEntrada';

// Configurar icono por defecto de Leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Función para obtener fecha/hora actual en formato datetime-local
const getMinDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Componente para capturar clics en el mapa
function LocationMarker({ position, setPosition, setFormData }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });

      // Hacer geocoding inverso para obtener la dirección
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          const address = data.display_name || '';
          const city = data.address?.city || data.address?.town || data.address?.village || '';

          setFormData(prev => ({
            ...prev,
            latitud: lat.toFixed(6),
            longitud: lng.toFixed(6),
            direccion: address,
            ciudad: city,
          }));
        })
        .catch(() => {
          // Si falla el geocoding, solo actualizar coordenadas
          setFormData(prev => ({
            ...prev,
            latitud: lat.toFixed(6),
            longitud: lng.toFixed(6),
          }));
        });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

const SolicitarEvento = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Datos de contacto
    nombre_contacto: '',
    email_contacto: '',
    telefono_contacto: '',
    nombre_empresa: '',

    // Datos del evento
    nombre_evento: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    categoria: 'otro',
    tipo_entrada: 'gratuito',
    precio: '',
    url_evento: '',
    imagen_url: '',

    // Ubicación
    direccion: '',
    ciudad: '',
    latitud: '',
    longitud: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.latitud || !formData.longitud) {
      setError('Por favor, selecciona una ubicación en el mapa haciendo clic en ella');
      return;
    }

    if (formData.tipo_entrada === 'pago' && !formData.precio) {
      setError('El precio es obligatorio para eventos de pago');
      return;
    }

    try {
      setLoading(true);

      // Preparar datos para enviar
      const dataToSend = { ...formData };

      // Limpiar campos opcionales vacíos
      if (!dataToSend.nombre_empresa) delete dataToSend.nombre_empresa;
      if (!dataToSend.fecha_fin) delete dataToSend.fecha_fin;
      if (!dataToSend.url_evento) delete dataToSend.url_evento;
      if (!dataToSend.imagen_url) delete dataToSend.imagen_url;
      if (dataToSend.tipo_entrada === 'gratuito') delete dataToSend.precio;

      await crearSolicitudEvento(dataToSend);
      setSuccess(true);

      // Mostrar mensaje de éxito y redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      setError(err.response?.data?.error || 'Error al enviar la solicitud. Por favor, verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Solicitud enviada!</h2>
          <p className="text-gray-600 mb-6">
            Tu solicitud de evento ha sido enviada exitosamente.
            Nuestro equipo la revisará y te contactaremos pronto.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-teal-600 hover:underline font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/login')}
            className="text-teal-600 hover:underline mb-4 flex items-center"
          >
            ← Volver al inicio de sesión
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Solicitar Evento</h1>
          <p className="text-gray-600 mt-2">
            Completa el formulario para solicitar la publicación de tu evento
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda: Formulario */}
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">

            {/* Datos de contacto */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Datos de Contacto</h3>
              <div className="space-y-4">
                <CampoEntrada
                  type="text"
                  name="nombre_contacto"
                  placeholder="Nombre de contacto *"
                  value={formData.nombre_contacto}
                  onChange={handleInputChange}
                  required
                />
                <CampoEntrada
                  type="email"
                  name="email_contacto"
                  placeholder="Email de contacto *"
                  value={formData.email_contacto}
                  onChange={handleInputChange}
                  required
                />
                <CampoEntrada
                  type="tel"
                  name="telefono_contacto"
                  placeholder="Teléfono de contacto *"
                  value={formData.telefono_contacto}
                  onChange={handleInputChange}
                  required
                />
                <CampoEntrada
                  type="text"
                  name="nombre_empresa"
                  placeholder="Nombre de empresa/organización (opcional)"
                  value={formData.nombre_empresa}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Datos del evento */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Información del Evento</h3>
              <div className="space-y-4">
                <CampoEntrada
                  type="text"
                  name="nombre_evento"
                  placeholder="Nombre del evento *"
                  value={formData.nombre_evento}
                  onChange={handleInputChange}
                  required
                />

                <div>
                  <textarea
                    name="descripcion"
                    placeholder="Descripción del evento *"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Fecha inicio *</label>
                    <input
                      type="datetime-local"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleInputChange}
                      min={getMinDateTime()}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Fecha fin (opcional)</label>
                    <input
                      type="datetime-local"
                      name="fecha_fin"
                      value={formData.fecha_fin}
                      onChange={handleInputChange}
                      min={formData.fecha_inicio || getMinDateTime()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Categoría *</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="deportivo">Deportivo</option>
                    <option value="cultural">Cultural</option>
                    <option value="salud">Salud y Bienestar</option>
                    <option value="recreativo">Recreativo</option>
                    <option value="educativo">Educativo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tipo de entrada *</label>
                    <select
                      name="tipo_entrada"
                      value={formData.tipo_entrada}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="gratuito">Gratuito</option>
                      <option value="pago">De Pago</option>
                    </select>
                  </div>
                  {formData.tipo_entrada === 'pago' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Precio *</label>
                      <input
                        type="number"
                        name="precio"
                        placeholder="0.00"
                        value={formData.precio}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        required={formData.tipo_entrada === 'pago'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>

                <CampoEntrada
                  type="url"
                  name="url_evento"
                  placeholder="URL del evento (opcional)"
                  value={formData.url_evento}
                  onChange={handleInputChange}
                />

                <CampoEntrada
                  type="url"
                  name="imagen_url"
                  placeholder="URL de imagen del evento (opcional)"
                  value={formData.imagen_url}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Ubicación</h3>
              <p className="text-sm text-gray-600 mb-4">
                Haz clic en el mapa para seleccionar la ubicación del evento
              </p>
              <div className="space-y-4">
                <CampoEntrada
                  type="text"
                  name="direccion"
                  placeholder="Dirección *"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
                <CampoEntrada
                  type="text"
                  name="ciudad"
                  placeholder="Ciudad *"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <CampoEntrada
                    type="text"
                    name="latitud"
                    placeholder="Latitud *"
                    value={formData.latitud}
                    onChange={handleInputChange}
                    required
                    readOnly
                  />
                  <CampoEntrada
                    type="text"
                    name="longitud"
                    placeholder="Longitud *"
                    value={formData.longitud}
                    onChange={handleInputChange}
                    required
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Error y botón de envío */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <BotonAccion type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </BotonAccion>
          </div>

          {/* Columna derecha: Mapa */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Selecciona la ubicación en el mapa
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Haz clic en el mapa para marcar la ubicación exacta de tu evento
            </p>
            <div className="h-[600px] rounded-lg overflow-hidden border border-gray-300">
              <MapContainer
                center={[-33.4489, -70.6693]} // Santiago, Chile por defecto
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                  position={mapPosition}
                  setPosition={setMapPosition}
                  setFormData={setFormData}
                />
              </MapContainer>
            </div>
            {mapPosition && (
              <div className="mt-4 text-sm text-gray-600">
                📍 Ubicación seleccionada: {mapPosition.lat.toFixed(4)}, {mapPosition.lng.toFixed(4)}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SolicitarEvento;
