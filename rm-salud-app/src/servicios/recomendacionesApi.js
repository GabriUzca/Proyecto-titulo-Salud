import api from "./http";

export const recomendacionesApi = {
  locales: (comuna) => api.get("/api/recommendations/locales/", { params: { comuna } }),

  poi: (lat, lng, radiusKm = 5) =>
    api.get("/api/recommendations/poi/", {
      params: {
        lat,
        lng,
        radius_km: radiusKm
      }
    }),
};