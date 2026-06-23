// store/restaurantDishStore.js
import { create } from 'zustand';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from './companyStore';

const useRestaurantDishStore = create((set, get) => ({
    dishes: [],
    stats: null,
    pagination: null,
    isLoading: false,
    error: null,

    filters: {
        page: 1,
        limit: 50,
        search: '',
        category_id: '',
        is_available: '',
        sort_by: 'name',
        sort_order: 'ASC',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters, page: newFilters.page || 1 },
        }));
        get().fetchDishes();
    },

    setPage: (page) => {
        set((state) => ({ filters: { ...state.filters, page } }));
        get().fetchDishes();
    },

    fetchDishes: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;

        set({ isLoading: true, error: null });
        try {
            const response = await restaurantApi.getDishes(companyId, get().filters);
            set({
                dishes: response.data.data.products,
                stats: response.data.data.stats,
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

    createDish: async (formData) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            // Ajouter company_id dans le FormData (sera lu par req.body via multer)
            formData.append('company_id', companyId);
            await restaurantApi.createDish(formData);
            get().fetchDishes();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la création.',
            };
        }
    },

    updateDish: async (id, formData) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            // Ajouter company_id dans le FormData
            formData.append('company_id', companyId);
            await restaurantApi.updateDish(id, formData);
            get().fetchDishes();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la mise à jour.',
            };
        }
    },

    deleteDish: async (id) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await restaurantApi.deleteDish(id, companyId);
            get().fetchDishes();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la suppression.',
            };
        }
    },

    toggleAvailability: async (id) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const response = await restaurantApi.toggleAvailability(id, companyId);
            get().fetchDishes();
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur.',
            };
        }
    },
}));

export default useRestaurantDishStore;