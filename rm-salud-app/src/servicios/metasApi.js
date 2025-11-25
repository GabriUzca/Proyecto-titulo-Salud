import api from "./http";

export const metasApi = {
  // Listar todas las metas del usuario (activas e inactivas)
  list: () => api.get("/api/metas/"),

  // Crear una nueva meta (automáticamente desactiva las anteriores)
  create: (data) => api.post("/api/metas/", data),

  // Obtener detalles de una meta específica
  get: (id) => api.get(`/api/metas/${id}/`),

  // Actualizar una meta
  update: (id, data) => api.patch(`/api/metas/${id}/`, data),

  // Eliminar una meta
  remove: (id) => api.delete(`/api/metas/${id}/`),

  // Obtener la meta activa del usuario
  getActiva: () => api.get("/api/metas/activa/"),

  // Archivar (desactivar) una meta sin eliminarla
  archivar: (id) => api.post(`/api/metas/${id}/archivar/`),
};
