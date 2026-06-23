// store/superAdminPlanStore.js
import { create } from 'zustand';
import { superAdminApi } from '@/lib/api/superAdmin';

const useSuperAdminPlanStore = create((set, get) => ({
    plans: [],
    stats: null,
    isLoading: false,
    error: null,
    includeInactive: false,

    setIncludeInactive: (value) => {
        set({ includeInactive: value });
        get().fetchPlans();
    },

    fetchPlans: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await superAdminApi.getPlans({
                include_inactive: get().includeInactive,
            });
            set({
                plans: response.data.data.plans,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des plans.',
                isLoading: false,
            });
        }
    },

    fetchStats: async () => {
        try {
            const response = await superAdminApi.getPlanStats();
            set({ stats: response.data.data });
        } catch (error) {
            console.error('Erreur chargement stats plans:', error);
        }
    },

    createPlan: async (data) => {
        try {
            await superAdminApi.createPlan(data);
            get().fetchPlans();
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la création du plan.',
            };
        }
    },

    updatePlan: async (id, data) => {
        try {
            await superAdminApi.updatePlan(id, data);
            get().fetchPlans();
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la mise à jour du plan.',
            };
        }
    },

    deletePlan: async (id) => {
        try {
            await superAdminApi.deletePlan(id);
            get().fetchPlans();
            get().fetchStats();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la suppression du plan.',
            };
        }
    },

    togglePlanStatus: async (id) => {
        try {
            const response = await superAdminApi.togglePlanStatus(id);
            get().fetchPlans();
            get().fetchStats();
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors du changement de statut.',
            };
        }
    },
}));

export default useSuperAdminPlanStore;