import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

function getTokens() {
  const access = localStorage.getItem("access") || sessionStorage.getItem("access");
  const refresh = localStorage.getItem("refresh") || sessionStorage.getItem("refresh");
  return { access, refresh };
}

function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

export { setTokens };

// Interceptor para agregar el token a cada petición
api.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// Interceptor para refrescar el token si expira
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    
    // Si el error es 401 y no hemos intentado refrescar
    if (error.response?.status === 401 && !original._retry) {
      const { refresh } = getTokens();
      if (!refresh) throw error;

      original._retry = true;

      // Evitar múltiples llamadas simultáneas al refresh
      refreshing = refreshing || axios.post(`${api.defaults.baseURL.replace('/api', '')}/api/auth/refresh`, { refresh })
        .then((r) => {
          const a = r.data?.access;
          if (a) {
            localStorage.setItem("access", a);
            api.defaults.headers.common.Authorization = `Bearer ${a}`;
          }
          return a;
        })
        .finally(() => { refreshing = null; });

      await refreshing;
      return api(original);
    }
    
    throw error;
  }
);

export default api;