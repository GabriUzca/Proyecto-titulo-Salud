import axios from "axios";
import api from "./http";

// Cliente sin autenticación para solicitudes públicas
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

/**
 * Servicio API para gestión de solicitudes de eventos
 */

// ────────────────────────────────────────────────────────────────────────────
// Endpoints públicos (sin autenticación)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Crear una solicitud de evento (sin autenticación requerida)
 * @param {Object} eventData - Datos de la solicitud de evento
 * @returns {Promise} Respuesta con la solicitud creada
 */
export const crearSolicitudEvento = async (eventData) => {
  const response = await publicApi.post("/eventos/solicitar/", eventData);
  return response.data;
};

// ────────────────────────────────────────────────────────────────────────────
// Endpoints de administración (requieren autenticación y permisos de staff)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Obtener lista de solicitudes de eventos
 * @param {Object} params - Parámetros de búsqueda y filtros
 * @param {string} params.estado - Filtrar por estado (pendiente, aprobada, rechazada)
 * @param {string} params.search - Búsqueda por nombre, empresa, contacto
 * @returns {Promise} Respuesta con lista de solicitudes
 */
export const listarSolicitudesEventos = async (params = {}) => {
  const response = await api.get("/eventos/admin/", { params });
  return response.data;
};

/**
 * Obtener detalle de una solicitud de evento
 * @param {number} id - ID de la solicitud
 * @returns {Promise} Respuesta con el detalle de la solicitud
 */
export const obtenerSolicitudEvento = async (id) => {
  const response = await api.get(`/eventos/admin/${id}/`);
  return response.data;
};

/**
 * Aprobar una solicitud de evento
 * @param {number} id - ID de la solicitud
 * @param {string} comentarios - Comentarios del administrador (opcional)
 * @returns {Promise} Respuesta con la solicitud aprobada
 */
export const aprobarSolicitudEvento = async (id, comentarios = "") => {
  const response = await api.post(`/eventos/admin/${id}/aprobar/`, {
    comentarios_admin: comentarios,
  });
  return response.data;
};

/**
 * Rechazar una solicitud de evento
 * @param {number} id - ID de la solicitud
 * @param {string} motivo - Motivo del rechazo (requerido)
 * @returns {Promise} Respuesta con la solicitud rechazada
 */
export const rechazarSolicitudEvento = async (id, motivo) => {
  if (!motivo) {
    throw new Error("El motivo de rechazo es obligatorio");
  }
  const response = await api.post(`/eventos/admin/${id}/rechazar/`, {
    comentarios_admin: motivo,
  });
  return response.data;
};

/**
 * Actualizar una solicitud de evento
 * @param {number} id - ID de la solicitud
 * @param {Object} eventData - Datos actualizados
 * @returns {Promise} Respuesta con la solicitud actualizada
 */
export const actualizarSolicitudEvento = async (id, eventData) => {
  const response = await api.patch(`/eventos/admin/${id}/`, eventData);
  return response.data;
};

/**
 * Eliminar una solicitud de evento
 * @param {number} id - ID de la solicitud
 * @returns {Promise} Respuesta de la eliminación
 */
export const eliminarSolicitudEvento = async (id) => {
  const response = await api.delete(`/eventos/admin/${id}/`);
  return response.data;
};

/**
 * Obtener estadísticas de solicitudes de eventos
 * @returns {Promise} Respuesta con estadísticas
 */
export const obtenerEstadisticasEventos = async () => {
  const response = await api.get("/eventos/admin/statistics/");
  return response.data;
};
