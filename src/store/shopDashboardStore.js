import { create } from 'zustand';
import { shopApi } from '@/lib/api/shop';
import useCompanyStore from './companyStore';

const useShopDashboardStore = create((set) => ({
    data: null,
    isLoading: true,
    startDate: null,
    endDate: null,

    setDates: (start, end) => set({ startDate: start, endDate: end }),

    fetchDashboard: async (startDate, endDate) => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;
        set({ isLoading: true });
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await shopApi.getDashboard(companyId, params);
            set({ data: response.data.data, isLoading: false, startDate, endDate });
        } catch {
            set({ isLoading: false });
        }
    },
}));

export default useShopDashboardStore;