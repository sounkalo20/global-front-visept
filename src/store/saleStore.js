import { create } from "zustand";
import { salesApi } from "@/lib/api/sales";

const useSaleStore = create((set, get) => ({
  sales: [],
  currentSale: null,
  stats: null,
  isLoading: false,
  totalSales: 0,
  totalPages: 1,

  fetchSales: async (companyId, params = {}) => {
    if (!companyId) return;
    set({ isLoading: true });
    try {
      const response = await salesApi.getAll(companyId, params);
      const { sales, pagination } = response.data.data;
      set({
        sales,
        totalSales: pagination.total,
        totalPages: pagination.pages,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchSaleById: async (id, companyId) => {
    set({ isLoading: true });
    try {
      const response = await salesApi.getById(id, companyId);
      set({ currentSale: response.data.data.sale, isLoading: false });
      return response.data.data.sale;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  fetchStats: async (companyId) => {
    if (!companyId) return;
    try {
      const response = await salesApi.getStats(companyId);
      set({ stats: response.data.data });
    } catch {}
  },

  createSale: async (data) => {
    try {
      const response = await salesApi.create(data);
      const sale = response.data.data.sale;
      set((state) => ({ sales: [sale, ...state.sales] }));
      return { success: true, sale };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur création vente.",
      };
    }
  },

  // NOUVEAU : Mettre à jour une vente
  updateSale: async (id, data) => {
    try {
      const response = await salesApi.update(id, data);
      const updatedSale = response.data.data.sale;
      set((state) => ({
        sales: state.sales.map((s) =>
          s.id === updatedSale.id ? updatedSale : s,
        ),
        currentSale: updatedSale,
      }));
      return { success: true, sale: updatedSale };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur modification vente.",
      };
    }
  },

  cancelSale: async (id, companyId, reason) => {
    try {
      await salesApi.cancel(id, {
        company_id: companyId,
        cancel_reason: reason,
      });
      set((state) => ({
        sales: state.sales.map((s) =>
          s.id === id ? { ...s, status: "canceled" } : s,
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
}));

export default useSaleStore;
