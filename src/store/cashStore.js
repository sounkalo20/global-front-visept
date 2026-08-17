import { create } from 'zustand';
import axios from '@/lib/axios';

const useCashStore = create((set, get) => ({
  registers: [],
  activeSession: null,
  sessionHistory: [],
  movements: [],
  isLoading: false,
  error: null,

  fetchRegisters: async (companyId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`/cash/registers?company_id=${companyId}`);
      set({ registers: data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur lors du chargement des caisses', isLoading: false });
    }
  },

  createRegister: async (companyId, name) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`/cash/registers`, { company_id: companyId, name });
      set(state => ({ registers: [...state.registers, data.data], isLoading: false }));
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur création caisse', isLoading: false });
      throw error;
    }
  },

  updateRegister: async (registerId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.put(`/cash/registers/${registerId}`, payload);
      set(state => ({
        registers: state.registers.map(reg => reg.id === registerId ? { ...reg, ...data.data } : reg),
        isLoading: false
      }));
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur modification caisse', isLoading: false });
      throw error;
    }
  },

  toggleRegisterStatus: async (registerId, companyId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.patch(`/cash/registers/${registerId}/toggle-status`);
      if (companyId) {
        await get().fetchRegisters(companyId);
      }
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur changement de statut', isLoading: false });
      throw error;
    }
  },

  deleteRegister: async (registerId, companyId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.delete(`/cash/registers/${registerId}`);
      set(state => ({
        registers: state.registers.filter(reg => reg.id !== registerId),
        isLoading: false
      }));
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur suppression caisse', isLoading: false });
      throw error;
    }
  },

  fetchActiveSession: async (companyId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`/cash/sessions/active?company_id=${companyId}`);
      set({ activeSession: data.data, isLoading: false });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur lors du chargement de la session', isLoading: false });
    }
  },

  fetchSessionHistory: async (companyId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`/cash/sessions?company_id=${companyId}`);
      set({ sessionHistory: data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur', isLoading: false });
    }
  },

  openSession: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`/cash/sessions/open`, payload);
      set({ activeSession: data.data, isLoading: false });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur ouverture de caisse', isLoading: false });
      throw error;
    }
  },

  closeSession: async (sessionId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(`/cash/sessions/${sessionId}/close`, payload);
      set({ activeSession: null, isLoading: false });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur clôture de caisse', isLoading: false });
      throw error;
    }
  },

  fetchMovements: async (sessionId, companyId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`/cash/sessions/${sessionId}/movements?company_id=${companyId}`);
      set({ movements: data.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur', isLoading: false });
    }
  },

}));

export default useCashStore;
