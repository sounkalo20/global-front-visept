// store/restaurantProductStore.js (NOUVEAU)
import { create } from 'zustand';
import { restaurantProductsApi } from '@/lib/api/restaurantProducts';
import useCompanyStore from './companyStore';

const useRestaurantProductStore = create((set, get) => ({
    products: [],
    stats: null,
    pagination: null,
    isLoading: false,
    error: null,

    filters: {
        page: 1,
        limit: 20,
        search: '',
        type: '',
        category_id: '',
        is_active: '',
        sort_by: 'created_at',
        sort_order: 'DESC',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
        }));
        get().fetchProducts();
    },

    setPage: (page) => {
        set((state) => ({ filters: { ...state.filters, page } }));
        get().fetchProducts();
    },

    fetchProducts: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await restaurantProductsApi.getAll(companyId, get().filters);
            set({
                products: response.data.data.products,
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
        const products = get().products;
        set({
            stats: {
                total: get().pagination?.total || products.length,
                dishes: products.filter(p => p.product_type === 'dish').length,
                ingredients: products.filter(p => p.product_type === 'ingredient').length,
                active: products.filter(p => p.is_active).length,
            },
        });
    },

    createProduct: async (data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const payload = { ...data, company_id: companyId };
            const response = await restaurantProductsApi.create(payload);
            get().fetchProducts();
            return { success: true, data: response.data.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la création.',
            };
        }
    },

    updateProduct: async (id, data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantProductsApi.update(id, { ...data, company_id: companyId });
            get().fetchProducts();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la mise à jour.',
            };
        }
    },

    deleteProduct: async (id) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantProductsApi.delete(id, companyId);
            get().fetchProducts();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la suppression.',
            };
        }
    },
}));

export default useRestaurantProductStore;