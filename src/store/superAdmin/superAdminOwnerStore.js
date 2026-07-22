import { create } from 'zustand';
import { superAdminApi } from '@/lib/api/superAdmin';

const useSuperAdminOwnerStore = create((set, get) => ({
    owners: [],
    isLoading: false,
    error: null,

    fetchOwners: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await superAdminApi.getOwners();
            set({
                owners: response.data.data.owners,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Erreur de chargement des propriétaires.',
                isLoading: false,
            });
        }
    },

    createOwner: async (data) => {
        try {
            await superAdminApi.createOwner(data);
            get().fetchOwners();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la création du propriétaire.',
            };
        }
    },

    grantUnlimitedAccess: async (id) => {
        try {
            await superAdminApi.grantUnlimitedAccess(id);
            get().fetchOwners();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de l\'attribution de l\'accès illimité.',
            };
        }
    },

    revokeUnlimitedAccess: async (id) => {
        try {
            await superAdminApi.revokeUnlimitedAccess(id);
            get().fetchOwners();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la révocation de l\'accès illimité.',
            };
        }
    },
}));

export default useSuperAdminOwnerStore;
