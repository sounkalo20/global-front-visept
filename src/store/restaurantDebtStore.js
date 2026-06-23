// store/restaurantDebtStore.js
import { create } from 'zustand';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from './companyStore';

const useRestaurantDebtStore = create((set, get) => ({
    debts: [],
    stats: null,
    pagination: null,
    isLoading: false,
    error: null,

    filters: {
        page: 1, limit: 20, status: '', client_id: '',
        search: '', overdue: '', start_date: '', end_date: '',
        sort_by: 'created_at', sort_order: 'DESC',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
        }));
        get().fetchDebts();
    },

    setPage: (page) => {
        set((state) => ({ filters: { ...state.filters, page } }));
        get().fetchDebts();
    },

    fetchDebts: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;
        set({ isLoading: true, error: null });
        try {
            const response = await restaurantApi.getDebts(companyId, get().filters);
            set({
                debts: response.data.data.debts,
                pagination: response.data.pagination,
                isLoading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Erreur.', isLoading: false });
        }
    },

    fetchStats: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;
        try {
            const response = await restaurantApi.getDebtStats(companyId);
            set({ stats: response.data.data });
        } catch (error) { console.error('Erreur stats:', error); }
    },

    createDebt: async (data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantApi.createDebt({ ...data, company_id: companyId });
            get().fetchDebts();
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },

    updateDebt: async (id, data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantApi.updateDebt(id, { ...data, company_id: companyId });
            get().fetchDebts();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },

    cancelDebt: async (id) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantApi.cancelDebt(id, companyId);
            get().fetchDebts();
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },
}));

export default useRestaurantDebtStore;