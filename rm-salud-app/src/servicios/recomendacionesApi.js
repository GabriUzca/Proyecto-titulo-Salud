import api from "./http";

export const recomendacionesApi = {
  locales: (comuna) => api.get("/api/recommendations/locales/", { params: { comuna } }),
};