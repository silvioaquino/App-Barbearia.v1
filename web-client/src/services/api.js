import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token on startup if available
const savedToken = localStorage.getItem('client_token');
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect for non-public endpoints
      const url = error.config?.url || '';
      if (!url.includes('/public/')) {
        localStorage.removeItem('client_token');
        delete api.defaults.headers.common['Authorization'];
        // Don't redirect if already on login or public pages
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/agendar') && 
            !window.location.pathname.includes('/auth-callback') &&
            window.location.pathname !== '/') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
