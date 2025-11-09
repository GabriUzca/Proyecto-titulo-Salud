import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarSolicitudesEventos,
  obtenerEstadisticasEventos,
  aprobarSolicitudEvento,
  rechazarSolicitudEvento,
  eliminarSolicitudEvento,
} from "../servicios/eventosApi";

export default function AdminEventos() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("all"); // all, pendiente, aprobada, rechazada
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalRechazo, setModalRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [comentariosAprobacion, setComentariosAprobacion] = useState("");

  useEffect(() => {
    document.title = 'Admin - Gestión de Eventos - RM Salud';
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = {};

      if (filtro !== "all") params.estado = filtro;
      if (busqueda) params.search = busqueda;

      const [solicitudesRes, statsRes] = await Promise.all([
        listarSolicitudesEventos(params),
        obtenerEstadisticasEventos()
      ]);

      setSolicitudes(solicitudesRes);
      setStats(statsRes);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setMensaje({ tipo: "error", texto: "Error al cargar solicitudes" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtro]);

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarDatos();
  };

  const abrirModal = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setSolicitudSeleccionada(null);
  };

  const abrirModalRechazo = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalRechazo(true);
    setMotivoRechazo("");
  };

  const cerrarModalRechazo = () => {
    setModalRechazo(false);
    setSolicitudSeleccionada(null);
    setMotivoRechazo("");
  };

  const handleAprobar = async (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setComentariosAprobacion("");

    if (!confirm(`¿Aprobar la solicitud de evento "${solicitud.nombre_evento}"?`)) return;

    try {
      await aprobarSolicitudEvento(solicitud.id, comentariosAprobacion);
      setMensaje({
        tipo: "success",
        texto: "Solicitud aprobada exitosamente"
      });
      cargarDatos();
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err.response?.data?.error || "Error al aprobar solicitud"
      });
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert("Debes proporcionar un motivo de rechazo");
      return;
    }

    try {
      await rechazarSolicitudEvento(solicitudSeleccionada.id, motivoRechazo);
      setMensaje({
        tipo: "success",
        texto: "Solicitud rechazada exitosamente"
      });
      cerrarModalRechazo();
      cargarDatos();
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err.response?.data?.error || "Error al rechazar solicitud"
      });
    }
  };

  const handleEliminar = async (id, nombreEvento) => {
    if (!confirm(`¿Eliminar permanentemente la solicitud "${nombreEvento}"?`)) return;

    try {
      await eliminarSolicitudEvento(id);
      setMensaje({
        tipo: "success",
        texto: "Solicitud eliminada exitosamente"
      });
      cargarDatos();
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err.response?.data?.error || "Error al eliminar solicitud"
      });
    }
  };

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprobada':
        return 'bg-green-100 text-green-800';
      case 'rechazada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/inicio')}
              className="mr-3 p-2 hover:bg-teal-500 rounded-full transition-colors"
            >
              ←
            </button>
            <div>
              <h2 className="text-2xl font-bold">Gestión de Solicitudes de Eventos</h2>
              <p className="text-teal-200 text-sm">Aprueba o rechaza solicitudes de eventos</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-teal-200 text-xs mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-teal-200 text-xs mb-1">Pendientes</p>
              <p className="text-2xl font-bold">{stats.pendientes}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-teal-200 text-xs mb-1">Aprobadas</p>
              <p className="text-2xl font-bold">{stats.aprobadas}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-teal-200 text-xs mb-1">Rechazadas</p>
              <p className="text-2xl font-bold">{stats.rechazadas}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 max-w-7xl mx-auto">
        {/* Mensaje de feedback */}
        {mensaje && (
          <div className={`mb-4 p-4 rounded-xl border ${
            mensaje.tipo === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Controles de búsqueda y filtro */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-4">
          <form onSubmit={handleBuscar} className="space-y-3">
            <input
              type="text"
              placeholder="Buscar por nombre del evento, empresa o contacto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <div className="flex gap-2 flex-wrap">
              {['all', 'pendiente', 'aprobada', 'rechazada'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltro(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filtro === f
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Lista de solicitudes */}
        <div className="space-y-4">
          {solicitudes.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-md text-center text-gray-500">
              No se encontraron solicitudes
            </div>
          ) : (
            solicitudes.map((solicitud) => (
              <div key={solicitud.id} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{solicitud.nombre_evento}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(solicitud.estado)}`}>
                        {solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <p><strong>Categoría:</strong> {solicitud.categoria}</p>
                      <p><strong>Ciudad:</strong> {solicitud.ciudad}</p>
                      <p><strong>Fecha:</strong> {formatearFecha(solicitud.fecha_inicio)}</p>
                      <p><strong>Tipo:</strong> {solicitud.tipo_entrada === 'gratuito' ? 'Gratuito' : `De pago ($${solicitud.precio})`}</p>
                    </div>

                    <div className="border-t pt-3 mt-3 text-sm text-gray-600">
                      <p><strong>Contacto:</strong> {solicitud.nombre_contacto}</p>
                      <p><strong>Email:</strong> {solicitud.email_contacto}</p>
                      <p><strong>Teléfono:</strong> {solicitud.telefono_contacto}</p>
                      {solicitud.nombre_empresa && <p><strong>Empresa:</strong> {solicitud.nombre_empresa}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => abrirModal(solicitud)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Ver Detalles
                  </button>

                  {solicitud.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleAprobar(solicitud)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => abrirModalRechazo(solicitud)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleEliminar(solicitud.id, solicitud.nombre_evento)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>

                {solicitud.comentarios_admin && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">Comentarios del administrador:</p>
                    <p className="text-sm text-blue-700 mt-1">{solicitud.comentarios_admin}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {modalAbierto && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Detalles de la Solicitud</h2>
              <button
                onClick={cerrarModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Información del Evento</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Nombre:</strong> {solicitudSeleccionada.nombre_evento}</p>
                  <p><strong>Descripción:</strong> {solicitudSeleccionada.descripcion}</p>
                  <p><strong>Categoría:</strong> {solicitudSeleccionada.categoria}</p>
                  <p><strong>Fecha inicio:</strong> {formatearFecha(solicitudSeleccionada.fecha_inicio)}</p>
                  {solicitudSeleccionada.fecha_fin && (
                    <p><strong>Fecha fin:</strong> {formatearFecha(solicitudSeleccionada.fecha_fin)}</p>
                  )}
                  <p><strong>Tipo de entrada:</strong> {solicitudSeleccionada.tipo_entrada}</p>
                  {solicitudSeleccionada.precio && <p><strong>Precio:</strong> ${solicitudSeleccionada.precio}</p>}
                  {solicitudSeleccionada.url_evento && (
                    <p><strong>URL:</strong> <a href={solicitudSeleccionada.url_evento} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{solicitudSeleccionada.url_evento}</a></p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Ubicación</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Dirección:</strong> {solicitudSeleccionada.direccion}</p>
                  <p><strong>Ciudad:</strong> {solicitudSeleccionada.ciudad}</p>
                  <p><strong>Coordenadas:</strong> {solicitudSeleccionada.latitud}, {solicitudSeleccionada.longitud}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Contacto</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Nombre:</strong> {solicitudSeleccionada.nombre_contacto}</p>
                  <p><strong>Email:</strong> {solicitudSeleccionada.email_contacto}</p>
                  <p><strong>Teléfono:</strong> {solicitudSeleccionada.telefono_contacto}</p>
                  {solicitudSeleccionada.nombre_empresa && (
                    <p><strong>Empresa:</strong> {solicitudSeleccionada.nombre_empresa}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Estado</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Estado:</strong> <span className={`px-2 py-1 rounded ${getBadgeColor(solicitudSeleccionada.estado)}`}>{solicitudSeleccionada.estado}</span></p>
                  <p><strong>Fecha de solicitud:</strong> {formatearFecha(solicitudSeleccionada.fecha_solicitud)}</p>
                  {solicitudSeleccionada.fecha_respuesta && (
                    <p><strong>Fecha de respuesta:</strong> {formatearFecha(solicitudSeleccionada.fecha_respuesta)}</p>
                  )}
                  {solicitudSeleccionada.respondido_por_nombre && (
                    <p><strong>Respondido por:</strong> {solicitudSeleccionada.respondido_por_nombre}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={cerrarModal}
              className="mt-6 w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de rechazo */}
      {modalRechazo && solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Rechazar Solicitud</h2>
            <p className="text-gray-600 mb-4">
              Estás a punto de rechazar la solicitud de "{solicitudSeleccionada.nombre_evento}".
              Por favor, proporciona un motivo:
            </p>

            <textarea
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              placeholder="Motivo del rechazo..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={handleRechazar}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar Rechazo
              </button>
              <button
                onClick={cerrarModalRechazo}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
