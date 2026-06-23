// store/supplierPaymentStore.js (REMPLACER COMPLÈTEMENT)
import { create } from 'zustand';
import { supplierOrdersApi } from '@/lib/api/supplierOrders';
import api from '@/lib/axios';
import useCompanyStore from './companyStore';

const useSupplierPaymentStore = create((set, get) => ({
    payments: [],
    stats: null,
    pagination: null,
    isLoading: false,
    error: null,

    filters: {
        page: 1,
        limit: 20,
        supplier_id: '',
        order_id: '',
        payment_method: '',
        search: '',
        date_from: '',
        date_to: '',
        sort_by: 'payment_date',
        sort_order: 'DESC',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
        }));
        get().fetchAllPayments();
    },

    setPage: (page) => {
        set((state) => ({ filters: { ...state.filters, page } }));
        get().fetchAllPayments();
    },

    fetchAllPayments: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/supplier-payments', {
                params: { ...get().filters, company_id: companyId },
            });
            set({
                payments: response.data.data.payments,
                stats: response.data.data.stats,
                pagination: response.data.data.pagination,
                isLoading: false,
            });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Erreur.', isLoading: false });
        }
    },

    addPaymentGlobal: async (data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await api.post('/supplier-payments', { ...data, company_id: companyId });
            get().fetchAllPayments();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },

    addPaymentToOrder: async (orderId, data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await supplierOrdersApi.addPayment(orderId, { ...data, company_id: companyId });
            get().fetchAllPayments();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },

    updatePayment: async (paymentId, data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await api.put(`/supplier-payments/${paymentId}`, { ...data, company_id: companyId });
            get().fetchAllPayments();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },

    deletePayment: async (paymentId) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await api.delete(`/supplier-payments/${paymentId}`, { params: { company_id: companyId } });
            get().fetchAllPayments();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erreur.' };
        }
    },
}));

export default useSupplierPaymentStore;