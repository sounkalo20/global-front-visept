import { create } from 'zustand';
import api from '@/lib/axios';
import useCompanyStore from './companyStore';

const usePermissionsStore = create((set, get) => ({
  permissions: [],
  roleName: null,
  isSystemRole: false,
  isLoading: false,
  isFetched: false,

  fetchPermissions: async (companyIdOverride = null) => {
    const activeCompany = useCompanyStore.getState().activeCompany;
    const targetCompanyId = companyIdOverride || activeCompany?.id;
    if (!targetCompanyId) {
      set({ permissions: [], roleName: null, isSystemRole: false, isFetched: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await api.get(`/rbac/${targetCompanyId}/my-permissions`);
      if (res.data.success) {
        set({
          permissions: res.data.data.permissions || [],
          roleName: res.data.data.role_name || null,
          isSystemRole: res.data.data.is_system_role || false,
          isFetched: true,
          isLoading: false
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des permissions", error);
      set({ permissions: [], roleName: null, isSystemRole: false, isFetched: true, isLoading: false });
    }
  },

  hasPermission: (permissionCode) => {
    const { permissions, isSystemRole, roleName } = get();
    // Le Propriétaire a toujours toutes les permissions
    if (isSystemRole && roleName === 'Propriétaire') return true;
    return permissions.includes(permissionCode);
  },

  clearPermissions: () => {
    set({ permissions: [], roleName: null, isSystemRole: false, isFetched: false });
  }
}));

// Synchroniser les permissions quand l'entreprise active change
useCompanyStore.subscribe(
  (state) => state.activeCompany,
  (activeCompany, previousActiveCompany) => {
    if (activeCompany?.id !== previousActiveCompany?.id) {
      usePermissionsStore.getState().fetchPermissions();
    }
  }
);

// Fetch initial si une entreprise est déjà active au chargement
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const activeComp = useCompanyStore.getState().activeCompany;
    if (activeComp && !usePermissionsStore.getState().isFetched) {
      usePermissionsStore.getState().fetchPermissions();
    }
  }, 100);
}

export default usePermissionsStore;
