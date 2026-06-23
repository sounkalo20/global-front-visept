// store/supplierOrderStore.js
import { create } from 'zustand';
import { supplierOrdersApi } from '@/lib/api/supplierOrders';
import useCompanyStore from './companyStore';

const useSupplierOrderStore = create((set, get) => ({
    orders: [],
    stats: null,
    pagination: null,
    isLoading: false,
    error: null,

    filters: {
        page: 1,
        limit: 20,
        supplier_id: '',
        status: '',
        search: '',
        sort_by: 'created_at',
        sort_order: 'DESC',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
        }));
        get().fetchOrders();
    },

    setPage: (page) => {
        set((state) => ({ filters: { ...state.filters, page } }));
        get().fetchOrders();
    },

    fetchOrders: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await supplierOrdersApi.getAll(companyId, get().filters);
            set({
                orders: response.data.data.orders,
                pagination: response.data.data.pagination,
                isLoading: false,
            });
            get().calculateStats();
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement.',
                isLoading: false,
            });
        }
    },

    calculateStats: () => {
        const orders = get().orders;
        set({
            stats: {
                total: get().pagination?.total || orders.length,
                pending: orders.filter(o => ['draft', 'ordered', 'confirmed'].includes(o.status)).length,
                received: orders.filter(o => ['partially_received', 'received'].includes(o.status)).length,
                total_amount: orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
                total_remaining: orders.reduce((sum, o) => sum + parseFloat(o.remaining_balance || 0), 0),
            },
        });
    },

    createOrder: async (data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const payload = { ...data, company_id: companyId };
            const response = await supplierOrdersApi.create(payload);
            get().fetchOrders();
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la création.',
            };
        }
    },

    updateOrder: async (id, data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await supplierOrdersApi.update(id, { ...data, company_id: companyId });
            get().fetchOrders();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la mise à jour.',
            };
        }
    },

    cancelOrder: async (id, reason) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await supplierOrdersApi.cancel(id, { reason, company_id: companyId });
            get().fetchOrders();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur lors de l'annulation.",
            };
        }
    },

    updateStatus: async (id, status) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await supplierOrdersApi.updateStatus(id, { status, company_id: companyId });
            get().fetchOrders();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors du changement de statut.',
            };
        }
    },

    receiveItems: async (id, items) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await supplierOrdersApi.receiveItems(id, { items, company_id: companyId });
            get().fetchOrders();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la réception.',
            };
        }
    },
}));

export default useSupplierOrderStore;