import api from "./http";

export const actividadApi = {
  list: (params) => api.get("/api/actividad/", { params }),
  create: (data) => api.post("/api/actividad/", data),
  update: (id, data) => api.patch(`/api/actividad/${id}/`, data),
  remove: (id) => api.delete(`/api/actividad/${id}/`),
};