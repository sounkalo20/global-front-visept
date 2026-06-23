// store/restaurantDashboardStore.js (NOUVEAU)
import { create } from 'zustand';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from './companyStore';

const useRestaurantDashboardStore = create((set) => ({
    data: null,
    isLoading: true,

    fetchDashboard: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;
        set({ isLoading: true });
        try {
            const response = await restaurantApi.getDashboard(companyId);
            set({ data: response.data.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },
}));

export default useRestaurantDashboardStore;