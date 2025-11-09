import api from "./http";

export const alimentacionApi = {
  list: (params) => api.get("/api/alimentacion/", { params }),
  create: (data) => api.post("/api/alimentacion/", data),
  update: (id, data) => api.patch(`/api/alimentacion/${id}/`, data),
  remove: (id) => api.delete(`/api/alimentacion/${id}/`),
};