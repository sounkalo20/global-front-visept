// store/superAdminDashboardStore.js (REMPLACER)
import { create } from 'zustand';
import { superAdminApi } from '@/lib/api/superAdmin';

const useSuperAdminDashboardStore = create((set) => ({
    data: null,
    isLoading: true,

    fetchDashboard: async () => {
        set({ isLoading: true });
        try {
            const response = await superAdminApi.getStats();
            set({ data: response.data.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },
}));

export default useSuperAdminDashboardStore;