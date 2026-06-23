// store/restaurantPaymentStore.js
import { create } from 'zustand';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from './companyStore';
import useRestaurantDebtStore from './restaurantDebtStore';

const useRestaurantPaymentStore = create((set, get) => ({
    payments: [],
    pagination: null,
    isLoading: false,

    filters: {
        page: 1, limit: 20, client_debt_id: '',
        payment_method: '', start_date: '', end_date: '',
        sort_by: 'created_at', sort_order: 'DESC',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
        }));
        get().fetchPayments();
    },

    setPage: (page) => {
        set((state) => ({ filters: { ...state.filters, page } }));
        get().fetchPayments();
    },

    fetchPayments: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;
        set({ isLoading: true });
        try {
            const response = await restaurantApi.getPayments(companyId, get().filters);
            set({
                payments: response.data.data.payments,
                pagination: response.data.pagination,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    createPayment: async (data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantApi.createPayment({ ...data, company_id: companyId });
            get().fetchPayments();
            useRestaurantDebtStore.getState().fetchDebts();
            useRestaurantDebtStore.getState().fetchStats();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },

    updatePayment: async (id, data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantApi.updatePayment(id, { ...data, company_id: companyId });
            get().fetchPayments();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },

    deletePayment: async (id) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantApi.deletePayment(id, companyId);
            get().fetchPayments();
            useRestaurantDebtStore.getState().fetchDebts();
            useRestaurantDebtStore.getState().fetchStats();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },
}));

export default useRestaurantPaymentStore;