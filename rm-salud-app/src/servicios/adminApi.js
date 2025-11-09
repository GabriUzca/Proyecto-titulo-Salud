// rm-salud-app/src/servicios/adminApi.js
import api from "./http";

export const adminApi = {
  listUsers: (params) => api.get("/api/admin/users/", { params }),
  getUser: (id) => api.get(`/api/admin/users/${id}/`),
  toggleUserActive: (id) => api.post(`/api/admin/users/${id}/toggle_active/`),
  updateUserInfo: (id, data) => api.patch(`/api/admin/users/${id}/update_basic_info/`, data),
  getStatistics: () => api.get("/api/admin/users/statistics/"),
  updateUser: (id, data) => api.patch(`/api/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}/`)
};
