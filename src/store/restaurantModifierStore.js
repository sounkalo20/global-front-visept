// store/restaurantModifierStore.js
import { create } from 'zustand';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from './companyStore';

const useRestaurantModifierStore = create((set, get) => ({
  groups: [],
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    const companyId = useCompanyStore.getState().activeCompany?.id;
    if (!companyId) return;

    set({ isLoading: true, error: null });
    try {
      const response = await restaurantApi.getModifierGroups(companyId);
      set({ groups: response.data.data.groups, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Erreur de chargement.', isLoading: false });
    }
  },

  createGroup: async (data) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const response = await restaurantApi.createModifierGroup({ ...data, company_id: companyId });
      get().fetchGroups();
      return { success: true, data: response.data.data.group };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur lors de la création.' };
    }
  },

  updateGroup: async (id, data) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      await restaurantApi.updateModifierGroup(id, { ...data, company_id: companyId });
      get().fetchGroups();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur lors de la mise à jour.' };
    }
  },

  deleteGroup: async (id) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      await restaurantApi.deleteModifierGroup(id, companyId);
      get().fetchGroups();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur lors de la suppression.' };
    }
  },

  // Récupérer les groupes associés à un plat (pour le POS)
  getDishModifiers: async (dishId) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      const response = await restaurantApi.getDishModifiers(dishId, companyId);
      return { success: true, groups: response.data.data.groups };
    } catch (error) {
      return { success: false, groups: [] };
    }
  },

  setDishModifiers: async (dishId, groupIds) => {
    try {
      const companyId = useCompanyStore.getState().activeCompany?.id;
      await restaurantApi.setDishModifiers(dishId, { company_id: companyId, group_ids: groupIds });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur.' };
    }
  },
}));

export default useRestaurantModifierStore;
