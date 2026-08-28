import { create } from "zustand";
import { proformasApi } from "@/lib/api/proformas";

const useProformaStore = create((set, get) => ({
  proformas: [],
  currentProforma: null,
  isLoading: false,
  totalProformas: 0,
  totalPages: 1,

  fetchProformas: async (companyId, params = {}) => {
    if (!companyId) return;
    set({ isLoading: true });
    try {
      const response = await proformasApi.getAll(companyId, params);
      const { proformas, pagination } = response.data.data;
      set({
        proformas,
        totalProformas: pagination.total,
        totalPages: pagination.pages,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchProformaById: async (id, companyId) => {
    set({ isLoading: true });
    try {
      const response = await proformasApi.getById(id, companyId);
      const proforma = response.data.data.proforma;
      set({ currentProforma: proforma, isLoading: false });
      return proforma;
    } catch (error) {
      set({ isLoading: false });
      return null;
    }
  },

  createProforma: async (data) => {
    try {
      const response = await proformasApi.create(data);
      const proforma = response.data.data.proforma;
      set((state) => ({ proformas: [proforma, ...state.proformas] }));
      return { success: true, proforma };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur création du proforma.",
      };
    }
  },

  cancelProforma: async (id, companyId) => {
    try {
      await proformasApi.cancel(id, companyId);
      set((state) => ({
        proformas: state.proformas.map((pf) =>
          pf.id === id ? { ...pf, status: "canceled" } : pf
        ),
      }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur lors de l'annulation.",
      };
    }
  },
}));

export default useProformaStore;
