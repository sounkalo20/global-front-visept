import { create } from 'zustand';
import api from '@/lib/axios';
import useCompanyStore from './companyStore';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  isLoading: true,
  isSessionExpired: false,

  setUser: (user) => set({ user, isAuthenticated: !!user, isSuperAdmin: !!user.is_super_admin }),

  setSessionExpired: (status) => set({ isSessionExpired: status }),

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('visept_token', token);
    }
    set({ token });
  },

  login: async (loginData) => {
    const response = await api.post('/auth/login', loginData);
    const { user, token } = response.data.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('visept_token', token);
      localStorage.setItem('visept_user', JSON.stringify(user));
    }

    set({ user, token, isAuthenticated: true, isSuperAdmin: !!user.is_super_admin, isSessionExpired: false });

    // Charger les entreprises après login
    if (!user.is_super_admin) {
      await useCompanyStore.getState().fetchCompanies();
    }
    return response.data;
  },

  register: async (registerData) => {
    const response = await api.post('/auth/register', registerData);
    const { user, token } = response.data.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('visept_token', token);
      localStorage.setItem('visept_user', JSON.stringify(user));
    }

    set({ user, token, isAuthenticated: true, isSuperAdmin: !!user.is_super_admin, isSessionExpired: false });
    return response.data;
  },

  logout: (expired = false) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('visept_token');
      localStorage.removeItem('visept_user');
      localStorage.removeItem('visept_companies');
      localStorage.removeItem('visept_activeCompany');
    }
    set({ user: null, token: null, isAuthenticated: false, isSessionExpired: expired });
    useCompanyStore.getState().setCompanies([]);
    useCompanyStore.getState().setActiveCompany(null);
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('visept_token') : null;
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const response = await api.get('/auth/me');
      const user = response.data.data.user;

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isSuperAdmin: user.is_super_admin || false
      });

      if (!user.is_super_admin) {
        await useCompanyStore.getState().fetchCompanies();
      }
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('visept_token');
        localStorage.removeItem('visept_user');
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isSuperAdmin: false
      });
    }
  },


  init: () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('visept_user') : null;
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('visept_token') : null;

    if (stored && storedToken) {
      try {
        const user = JSON.parse(stored);
        set({
          user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
          isSuperAdmin: user.is_super_admin || false
        });
        if (!user.is_super_admin) {
          useCompanyStore.getState().initCompanies();
        }
      } catch {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;