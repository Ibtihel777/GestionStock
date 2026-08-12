import axios from 'axios';

const api = axios.create();

export const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem('erpstock_session') ?? 'null');
  } catch {
    localStorage.removeItem('erpstock_session');
    return null;
  }
};

api.interceptors.request.use((config) => {
  const session = getStoredSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

export default api;
