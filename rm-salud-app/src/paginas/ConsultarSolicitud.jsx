import React, { useState } from 'react';
import { consultarSolicitudPorCodigo } from '../servicios/eventosApi';
import BotonAccion from '../componentes/comunes/BotonAccion';
import CampoEntrada from '../componentes/comunes/CampoEntrada';

const ConsultarSolicitud = () => {
  const [codigo, setCodigo] = useState('');
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConsultar = async (e) => {
    e.preventDefault();

    if (!codigo.trim()) {
      setError('Por favor ingresa un código de seguimiento');
      return;
    }

    setLoading(true);
    setError(null);
    setSolicitud(null);

    try {
      const data = await consultarSolicitudPorCodigo(codigo);
      setSolicitud(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No se encontró ninguna solicitud con ese código');
      } else {
        setError('Error al consultar la solicitud. Por favor intenta de nuevo.');
      }
      console.error('Error al consultar solicitud:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      aprobada: 'bg-green-100 text-green-800 border-green-300',
      rechazada: 'bg-red-100 text-red-800 border-red-300',
    };

    const labels = {
      pendiente: 'Pendiente',
      aprobada: 'Aprobada',
      rechazada: 'Rechazada',
    };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${badges[estado]}`}>
        {labels[estado]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Consultar Estado de Solicitud
        </h1>
        <p className="text-gray-600 mb-8">
          Ingresa tu código de seguimiento para verificar el estado de tu solicitud de evento
        </p>

        {/* Formulario de búsqueda */}
        <form onSubmit={handleConsultar} className="mb-8">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <CampoEntrada
                etiqueta="Código de Seguimiento"
                tipo="text"
                nombre="codigo"
                valor={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: A3K7M9P2Q5W8"
                requerido
                maxLength={12}
                className="uppercase"
              />
              <p className="text-sm text-gray-500 mt-1">
                El código fue enviado a tu correo al crear la solicitud
              </p>
            </div>
            <BotonAccion
              tipo="submit"
              loading={loading}
              disabled={!codigo.trim() || loading}
            >
              Consultar
            </BotonAccion>
          </div>
        </form>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resultados de la consulta */}
        {solicitud && (
          <div className="border-2 border-gray-200 rounded-lg p-6 space-y-6">
            {/* Estado */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {solicitud.nombre_evento}
                </h2>
                <p className="text-gray-600 mt-1">
                  Código: <span className="font-mono font-semibold">{solicitud.codigo_seguimiento}</span>
                </p>
              </div>
              {getEstadoBadge(solicitud.estado)}
            </div>

            {/* Información del evento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Detalles del Evento</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Categoría:</span>{' '}
                    <span className="text-gray-800 capitalize">{solicitud.categoria}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fecha inicio:</span>{' '}
                    <span className="text-gray-800">{formatDate(solicitud.fecha_inicio)}</span>
                  </div>
                  {solicitud.fecha_fin && (
                    <div>
                      <span className="font-medium text-gray-600">Fecha fin:</span>{' '}
                      <span className="text-gray-800">{formatDate(solicitud.fecha_fin)}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-600">Tipo:</span>{' '}
                    <span className="text-gray-800 capitalize">{solicitud.tipo_entrada}</span>
                    {solicitud.precio && ` - $${solicitud.precio}`}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Ubicación</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Ciudad:</span>{' '}
                    <span className="text-gray-800">{solicitud.ciudad || 'No especificada'}</span>
                  </div>
                  {solicitud.direccion && (
                    <div>
                      <span className="font-medium text-gray-600">Dirección:</span>{' '}
                      <span className="text-gray-800">{solicitud.direccion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            {solicitud.descripcion && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-600 text-sm">{solicitud.descripcion}</p>
              </div>
            )}

            {/* Fechas de gestión */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Información de Seguimiento</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Fecha de solicitud:</span>{' '}
                  <span className="text-gray-800">{formatDate(solicitud.fecha_solicitud)}</span>
                </div>
                {solicitud.fecha_respuesta && (
                  <div>
                    <span className="font-medium text-gray-600">Fecha de respuesta:</span>{' '}
                    <span className="text-gray-800">{formatDate(solicitud.fecha_respuesta)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comentarios del administrador */}
            {solicitud.comentarios_admin && (
              <div className={`rounded-lg p-4 ${
                solicitud.estado === 'aprobada'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  solicitud.estado === 'aprobada' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {solicitud.estado === 'aprobada' ? 'Comentarios' : 'Motivo del Rechazo'}
                </h3>
                <p className={`text-sm ${
                  solicitud.estado === 'aprobada' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {solicitud.comentarios_admin}
                </p>
              </div>
            )}

            {/* Mensaje de estado pendiente */}
            {solicitud.estado === 'pendiente' && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por correo cuando sea procesada.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-700 mb-3">¿No tienes tu código?</h3>
          <p className="text-sm text-gray-600">
            El código de seguimiento fue enviado a tu correo electrónico al momento de crear la solicitud.
            Revisa tu bandeja de entrada y carpeta de spam. Si no lo encuentras, puedes crear una nueva solicitud.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsultarSolicitud;
