// store/superAdminPaymentStore.js
import { create } from 'zustand';
import { superAdminApi } from '@/lib/api/superAdmin';

const useSuperAdminPaymentStore = create((set, get) => ({
    payments: [],
    pagination: null,
    isLoading: false,
    error: null,
    page: 1,
    limit: 20,

    setPage: (page) => {
        set({ page });
        get().fetchPayments();
    },

    fetchPayments: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await superAdminApi.getPendingPayments({
                page: get().page,
                limit: get().limit,
            });
            set({
                payments: response.data.data.payments,
                pagination: response.data.data.pagination,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des paiements.',
                isLoading: false,
            });
        }
    },

    approvePayment: async (id) => {
        try {
            await superAdminApi.approvePayment(id);
            get().fetchPayments();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur lors de l'approbation.",
            };
        }
    },

    rejectPayment: async (id, reason) => {
        try {
            await superAdminApi.rejectPayment(id, { reason });
            get().fetchPayments();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors du rejet.',
            };
        }
    },
}));

export default useSuperAdminPaymentStore;