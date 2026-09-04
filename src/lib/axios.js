import axios from 'axios';
import useAuthStore from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur : ajouter automatiquement le token et x-company-id
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('visept_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.headers['x-company-id']) {
      try {
        const storedCompany = localStorage.getItem('visept_activeCompany');
        if (storedCompany) {
          const parsed = JSON.parse(storedCompany);
          if (parsed?.id) {
            config.headers['x-company-id'] = parsed.id;
          }
        }
      } catch (e) {
        console.error('Erreur lecture activeCompany dans axios:', e);
      }
    }
  }
  return config;
});

// Intercepteur : gestion globale des erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        useAuthStore.getState().logout(true);
      }
    } else if (error.response?.status === 403 && typeof window !== 'undefined') {
      // Si la requête vient du hook de permissions lui-même, on ignore la redirection
      const isRbacRequest = error.config?.url?.includes('/my-permissions');
      if (!isRbacRequest && window.location.pathname !== '/shop/forbidden') {
        window.location.href = '/shop/forbidden';
      }
    }
    return Promise.reject(error);
  }
);

export default api;