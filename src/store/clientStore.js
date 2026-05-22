import { create } from "zustand";
import { clientsApi } from "@/lib/api/clients";

const useClientStore = create((set, get) => ({
  clients: [],
  clientDetails: null,
  stats: null,
  isLoading: false,
  totalClients: 0,
  totalPages: 1,
  searchResults: [],

  fetchClients: async (companyId, params = {}) => {
    if (!companyId) return;
    set({ isLoading: true });
    try {
      const response = await clientsApi.getAll(companyId, params);
      const { clients, stats, pagination } = response.data.data;
      set({
        clients,
        stats,
        totalClients: pagination.total,
        totalPages: pagination.pages,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchClientById: async (id, companyId) => {
    set({ isLoading: true });
    try {
      const response = await clientsApi.getById(id, companyId);
      set({ clientDetails: response.data.data.client, isLoading: false });
      return response.data.data.client;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  createClient: async (data) => {
    try {
      const response = await clientsApi.create(data);
      const client = response.data.data.client;
      set((state) => ({ clients: [client, ...state.clients] }));
      return { success: true, client };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur création client.",
      };
    }
  },

  updateClient: async (id, data) => {
    try {
      const response = await clientsApi.update(id, data);
      const updated = response.data.data.client;
      set((state) => ({
        clients: state.clients.map((c) => (c.id === updated.id ? updated : c)),
        clientDetails:
          state.clientDetails?.id === updated.id
            ? updated
            : state.clientDetails,
      }));
      return { success: true, client: updated };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur modification client.",
      };
    }
  },

  deleteClient: async (id, companyId) => {
    try {
      await clientsApi.delete(id, companyId);
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
      }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur suppression client.",
      };
    }
  },

  searchClients: async (companyId, q) => {
    if (!q || q.length < 2) {
      set({ searchResults: [] });
      return;
    }
    try {
      const response = await clientsApi.search(companyId, q);
      set({ searchResults: response.data.data.clients });
    } catch {
      set({ searchResults: [] });
    }
  },

  fetchStats: async (companyId) => {
    try {
      const response = await clientsApi.getStats(companyId);
      set({ stats: response.data.data });
    } catch {}
  },

  clearDetails: () => set({ clientDetails: null }),
}));

export default useClientStore;
