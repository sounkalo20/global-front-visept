// store/restaurantSaleStore.js
import { create } from 'zustand';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from './companyStore';

const useRestaurantSaleStore = create((set, get) => ({
    sales: [],
    stats: null,
    pagination: null,
    isLoading: false,
    error: null,

    filters: {
        page: 1,
        limit: 20,
        start_date: '',
        end_date: '',
        client_id: '',
        status: '',
        payment_status: '',
        search: '',
        sort_by: 'created_at',
        sort_order: 'DESC',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
        }));
        get().fetchSales();
    },

    setPage: (page) => {
        set((state) => ({ filters: { ...state.filters, page } }));
        get().fetchSales();
    },

    fetchSales: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await restaurantApi.getSales(companyId, get().filters);
            set({
                sales: response.data.data.sales,
                pagination: response.data.data.pagination,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement.',
                isLoading: false,
            });
        }
    },

    fetchStats: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;
        try {
            const response = await restaurantApi.getSalesStats(companyId);
            set({ stats: response.data.data });
        } catch (error) {
            console.error('Erreur stats:', error);
        }
    },

    createSale: async (data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const payload = { ...data, company_id: companyId };
            const response = await restaurantApi.createSale(payload);
            get().fetchSales();
            get().fetchStats();
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la création.',
            };
        }
    },

    updateSale: async (id, data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantApi.updateSale(id, { ...data, company_id: companyId });
            get().fetchSales();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la mise à jour.',
            };
        }
    },

    cancelSale: async (id, reason) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantApi.cancelSale(id, { cancel_reason: reason, company_id: companyId });
            get().fetchSales();
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur lors de l'annulation.",
            };
        }
    },
}));

export default useRestaurantSaleStore;