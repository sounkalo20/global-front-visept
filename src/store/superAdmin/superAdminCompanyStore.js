// store/superAdminCompanyStore.js
import { create } from 'zustand';
import { superAdminApi } from '@/lib/api/superAdmin';

const useSuperAdminCompanyStore = create((set, get) => ({
    companies: [],
    stats: null,
    pagination: null,
    isLoading: false,
    error: null,

    // Filtres
    filters: {
        page: 1,
        limit: 20,
        search: '',
        status: '',
        business_type: '',
        plan: '',
        sort_by: 'created_at',
        sort_order: 'DESC',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
        }));
        get().fetchCompanies();
    },

    setPage: (page) => {
        set((state) => ({ filters: { ...state.filters, page } }));
        get().fetchCompanies();
    },

    fetchCompanies: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await superAdminApi.getCompanies(get().filters);
            set({
                companies: response.data.data.companies,
                pagination: response.data.data.pagination,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des entreprises.',
                isLoading: false,
            });
        }
    },

    fetchStats: async () => {
        try {
            const response = await superAdminApi.getCompanyStats();
            set({ stats: response.data.data });
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    },

    suspendCompany: async (id, reason) => {
        try {
            await superAdminApi.suspendCompany(id, { reason });
            get().fetchCompanies();
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la suspension.',
            };
        }
    },

    reactivateCompany: async (id) => {
        try {
            await superAdminApi.reactivateCompany(id);
            get().fetchCompanies();
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la réactivation.',
            };
        }
    },
}));

export default useSuperAdminCompanyStore;