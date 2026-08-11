import { create } from 'zustand';
import { inventoryApi } from '@/lib/api/inventory';
import useCompanyStore from './companyStore';

const useInventoryStore = create((set, get) => ({
  // État
  sessions: [],
  currentSession: null,
  dashboard: null,
  isLoading: false,
  isSaving: false,
  pagination: null,

  // ─── DASHBOARD ──────────────────────────────────────────────────────────────
  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await inventoryApi.getDashboard(companyId);
      set({ dashboard: res.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Erreur dashboard inventaire:', error);
    }
  },

  // ─── SESSIONS ───────────────────────────────────────────────────────────────
  fetchSessions: async (params = {}) => {
    set({ isLoading: true });
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await inventoryApi.getSessions(companyId, params);
      set({
        sessions: res.data.data,
        pagination: res.data.pagination,
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Erreur chargement sessions:', error);
    }
  },

  fetchSession: async (id) => {
    set({ isLoading: true });
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await inventoryApi.getSession(id, companyId);
      set({ currentSession: res.data.data, isLoading: false });
      return res.data.data;
    } catch (error) {
      set({ isLoading: false });
      console.error('Erreur chargement session:', error);
      throw error;
    }
  },

  createSession: async (data) => {
    set({ isSaving: true });
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await inventoryApi.createSession({ ...data, company_id: companyId });
      set({ isSaving: false });
      return res.data.data;
    } catch (error) {
      set({ isSaving: false });
      throw error;
    }
  },

  // ─── CYCLE DE VIE ────────────────────────────────────────────────────────────
  startSession: async (id) => {
    const companyId = useCompanyStore.getState().activeCompany?.id;
    const res = await inventoryApi.startSession(id, companyId);
    await get().fetchSession(id);
    return res.data;
  },

  completeSession: async (id) => {
    const companyId = useCompanyStore.getState().activeCompany?.id;
    const res = await inventoryApi.completeSession(id, companyId);
    await get().fetchSession(id);
    return res.data;
  },

  resumeSession: async (id) => {
    const companyId = useCompanyStore.getState().activeCompany?.id;
    const res = await inventoryApi.resumeSession(id, companyId);
    await get().fetchSession(id);
    return res.data;
  },

  validateSession: async (id) => {
    const companyId = useCompanyStore.getState().activeCompany?.id;
    const res = await inventoryApi.validateSession(id, companyId);
    await get().fetchSession(id);
    return res.data;
  },

  cancelSession: async (id) => {
    const companyId = useCompanyStore.getState().activeCompany?.id;
    const res = await inventoryApi.cancelSession(id, companyId);
    await get().fetchSession(id);
    return res.data;
  },

  // ─── ITEMS ──────────────────────────────────────────────────────────────────
  updateItem: async (sessionId, itemId, data) => {
    set({ isSaving: true });
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await inventoryApi.updateItem(sessionId, itemId, { ...data, company_id: companyId });
      
      // Mettre à jour l'item localement dans currentSession
      const currentSession = get().currentSession;
      if (currentSession) {
        const updatedItems = currentSession.items.map(item => {
          if (item.id === parseInt(itemId)) {
            return {
              ...item,
              counted_qty: res.data.data.counted_qty,
              difference: res.data.data.difference,
              discrepancy_value: res.data.data.discrepancy_value,
              justification: data.justification || item.justification,
              justification_note: data.justification_note || item.justification_note,
            };
          }
          return item;
        });
        set({ currentSession: { ...currentSession, items: updatedItems } });
      }
      
      set({ isSaving: false });
      return res.data.data;
    } catch (error) {
      set({ isSaving: false });
      throw error;
    }
  },

  // ─── RESET ──────────────────────────────────────────────────────────────────
  reset: () => set({
    sessions: [],
    currentSession: null,
    dashboard: null,
    isLoading: false,
    isSaving: false,
    pagination: null,
  }),
}));

export default useInventoryStore;
