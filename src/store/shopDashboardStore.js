// store/shopDashboardStore.js (NOUVEAU)
import { create } from 'zustand';
import { shopApi } from '@/lib/api/shop';
import useCompanyStore from './companyStore';

const useShopDashboardStore = create((set) => ({
    data: null,
    isLoading: true,

    fetchDashboard: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;
        set({ isLoading: true });
        try {
            const response = await shopApi.getDashboard(companyId);
            set({ data: response.data.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },
}));

export default useShopDashboardStore;