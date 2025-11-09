import api from "./http";

export const perfilApi = {
  getMe: () => api.get("/api/auth/me"),
  updateMe: (payload) => {
    const form = new FormData();
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        form.append(k, v);
      }
    });
    return api.patch("/api/auth/me/update", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
};