import { create } from "zustand";
import { debtsApi } from "@/lib/api/debts";

const useDebtStore = create((set, get) => ({
  debts: [],
  currentDebt: null,
  stats: null,
  isLoading: false,
  totalDebts: 0,
  totalPages: 1,

  fetchDebts: async (companyId, params = {}) => {
    if (!companyId) return;
    set({ isLoading: true });
    try {
      const response = await debtsApi.getAll(companyId, params);
      const responseData = response.data;
      const debts = responseData?.data?.debts || [];
      const pagination = responseData?.pagination || {};

      set({
        debts: debts,
        totalDebts: pagination.total || 0,
        totalPages: pagination.pages || 1,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erreur fetchDebts:", error);
      set({ debts: [], isLoading: false });
    }
  },

  fetchDebtById: async (id, companyId) => {
    set({ isLoading: true });
    try {
      const response = await debtsApi.getById(id, companyId);
      set({ currentDebt: response.data.data.debt, isLoading: false });
      return response.data.data.debt;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  fetchStats: async (companyId) => {
    if (!companyId) return;
    try {
      const response = await debtsApi.getStats(companyId);
      set({ stats: response.data.data });
    } catch {}
  },

  createDebt: async (data) => {
    try {
      const response = await debtsApi.create(data);
      const debt = response.data.data.debt;
      set((state) => ({ debts: [debt, ...state.debts] }));
      return { success: true, debt };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur création dette.",
      };
    }
  },

  updateDebt: async (id, data) => {
    try {
      const response = await debtsApi.update(id, data);
      const updated = response.data.data.debt;
      set((state) => ({
        debts: state.debts.map((d) => (d.id === updated.id ? updated : d)),
        currentDebt:
          state.currentDebt?.id === updated.id ? updated : state.currentDebt,
      }));
      return { success: true, debt: updated };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur modification.",
      };
    }
  },

  cancelDebt: async (id, companyId) => {
    try {
      await debtsApi.cancel(id, companyId);
      set((state) => ({
        debts: state.debts.map((d) =>
          d.id === id ? { ...d, status: "canceled", remaining_amount: 0 } : d,
        ),
      }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur annulation.",
      };
    }
  },

  // Paiements
  createPayment: async (data) => {
    try {
      const response = await debtsApi.createPayment(data);
      const updatedDebt = response.data.data.debt;
      set((state) => ({
        currentDebt:
          state.currentDebt?.id === updatedDebt.id
            ? updatedDebt
            : state.currentDebt,
      }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur paiement.",
      };
    }
  },

  deletePayment: async (id, companyId) => {
    try {
      await debtsApi.deletePayment(id, companyId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur suppression.",
      };
    }
  },

  clearDetails: () => set({ currentDebt: null }),
}));

export default useDebtStore;
