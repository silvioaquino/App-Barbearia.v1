import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://cutflow-8.preview.emergentagent.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('client_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('client_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
