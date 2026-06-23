// store/supplierStore.js
import { create } from 'zustand';
import { suppliersApi } from '@/lib/api/suppliers';
import useCompanyStore from './companyStore';

const useSupplierStore = create((set, get) => ({
    suppliers: [],
    stats: null,
    pagination: null,
    isLoading: false,
    error: null,

    filters: {
        page: 1,
        limit: 20,
        search: '',
        status: '',
        sort_by: 'created_at',
        sort_order: 'DESC',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
        }));
        get().fetchSuppliers();
    },

    setPage: (page) => {
        set((state) => ({ filters: { ...state.filters, page } }));
        get().fetchSuppliers();
    },

    fetchSuppliers: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await suppliersApi.getAll(companyId, get().filters);
            set({
                suppliers: response.data.data.suppliers,
                pagination: response.data.data.pagination,
                isLoading: false,
            });
            get().calculateStats();
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des fournisseurs.',
                isLoading: false,
            });
        }
    },

    calculateStats: () => {
        const suppliers = get().suppliers;
        set({
            stats: {
                total: suppliers.length,
                active: suppliers.filter((s) => s.is_active).length,
                with_debt: suppliers.filter((s) => parseFloat(s.current_balance) > 0).length,
                total_debt: suppliers.reduce((sum, s) => sum + parseFloat(s.current_balance || 0), 0),
            },
        });
    },

    createSupplier: async (data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const payload = { ...data, company_id: companyId };
            const response = await suppliersApi.create(payload);
            get().fetchSuppliers();
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la création.',
            };
        }
    },

    updateSupplier: async (id, data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const payload = { ...data, company_id: companyId };
            await suppliersApi.update(id, payload);
            get().fetchSuppliers();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la mise à jour.',
            };
        }
    },

    deleteSupplier: async (id) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await suppliersApi.delete(id, companyId);
            get().fetchSuppliers();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la suppression.',
            };
        }
    },

    toggleStatus: async (id) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const response = await suppliersApi.toggleStatus(id, companyId);
            get().fetchSuppliers();
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors du changement de statut.',
            };
        }
    },
}));

export default useSupplierStore;