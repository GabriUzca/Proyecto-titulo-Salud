import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Adjunta token si existe
api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access');
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// Refresh automático (una vez) si 401
let refreshing = false;
let queue = [];
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((res, rej) => queue.push({res, rej, original}));
      }
      original._retry = true;
      refreshing = true;
      try {
        const refresh = localStorage.getItem('refresh');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refresh });
        localStorage.setItem('access', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        const resp = await api(original);
        queue.forEach(({res}) => res(api(original)));
        queue = [];
        return resp;
      } catch (e) {
        queue.forEach(({rej}) => rej(e));
        queue = [];
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        throw e;
      } finally {
        refreshing = false;
      }
    }
    throw error;
  }
);

export const authApi = {
  login: (emailOrUsername, password) =>
    api.post('/auth/login', { username: emailOrUsername, password }),
  register: ({ username, email, password }) =>
    api.post('/auth/register', { username, email, password }),
  me: () => api.get('/auth/me'),
};

export default api;
