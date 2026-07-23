import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coligo_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('coligo_admin_token');
      window.location.href = '/login';
    }
    const msg = err.response?.data?.error || err.response?.data?.detail || 'Erreur.';
    return Promise.reject(new Error(msg));
  }
);

export default api;
