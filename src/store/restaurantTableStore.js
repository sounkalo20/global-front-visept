// store/restaurantTableStore.js
import { create } from 'zustand';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from './companyStore';

const useRestaurantTableStore = create((set, get) => ({
  spaces: [],
  tables: [],
  stats: null,
  activeSpaceId: null, // null = tous les espaces
  viewMode: 'grid', // 'grid' | 'plan'
  isLoading: false,
  error: null,

  setActiveSpaceId: (spaceId) => {
    set({ activeSpaceId: spaceId });
    get().fetchTables();
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  // ── Espaces ────────────────────────────────────────────────
  fetchSpaces: async () => {
    const companyId = useCompanyStore.getState().activeCompany?.id;
    if (!companyId) return;

    try {
      const response = await restaurantApi.getSpaces(companyId);
      set({ spaces: response.data.data.spaces });
    } catch (error) {
      console.error('Erreur chargement espaces:', error);
    }
  },

  createSpace: async (data) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await restaurantApi.createSpace({ ...data, company_id: companyId });
      get().fetchSpaces();
      return { success: true, space: res.data.data.space };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur lors de la création de l\'espace.' };
    }
  },

  updateSpace: async (id, data) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      await restaurantApi.updateSpace(id, { ...data, company_id: companyId });
      get().fetchSpaces();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur de mise à jour.' };
    }
  },

  deleteSpace: async (id) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      await restaurantApi.deleteSpace(id, companyId);
      get().fetchSpaces();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur lors de la suppression.' };
    }
  },

  // ── Tables ─────────────────────────────────────────────────
  fetchTables: async () => {
    const companyId = useCompanyStore.getState().activeCompany?.id;
    if (!companyId) return;

    set({ isLoading: true, error: null });
    try {
      const params = {};
      if (get().activeSpaceId) params.space_id = get().activeSpaceId;

      const response = await restaurantApi.getFloorPlan(companyId, params);
      set({
        tables: response.data.data.tables,
        stats: response.data.data.stats,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement des tables.',
        isLoading: false,
      });
    }
  },

  createTable: async (data) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      await restaurantApi.createTable({ ...data, company_id: companyId });
      get().fetchTables();
      get().fetchSpaces();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur lors de la création de la table.' };
    }
  },

  updateTable: async (id, data) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      await restaurantApi.updateTable(id, { ...data, company_id: companyId });
      get().fetchTables();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur de mise à jour.' };
    }
  },

  savePositions: async (positions) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      await restaurantApi.updatePositions({ company_id: companyId, positions });
      get().fetchTables();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur lors de la sauvegarde.' };
    }
  },

  // ── Sessions & Statuts ─────────────────────────────────────
  openSession: async (tableId, numberOfGuests) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await restaurantApi.openSession({
        company_id: companyId,
        table_id: tableId,
        number_of_guests: numberOfGuests,
      });
      get().fetchTables();
      return { success: true, data: res.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur d\'ouverture de table.',
      };
    }
  },

  updateTableStatus: async (tableId, status) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await restaurantApi.updateTableStatus(tableId, { company_id: companyId, status });
      get().fetchTables();
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de changement de statut.',
      };
    }
  },

  transferTable: async (sessionId, targetTableId) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await restaurantApi.transferTable({
        company_id: companyId,
        session_id: sessionId,
        target_table_id: targetTableId,
      });
      get().fetchTables();
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du transfert.',
      };
    }
  },

  mergeTables: async (primaryTableId, secondaryTableId) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const res = await restaurantApi.mergeTables({
        company_id: companyId,
        primary_table_id: primaryTableId,
        secondary_table_id: secondaryTableId,
      });
      get().fetchTables();
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la fusion.',
      };
    }
  },
}));

export default useRestaurantTableStore;
