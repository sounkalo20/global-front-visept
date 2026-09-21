// store/shopDashboardStore.js
import { create } from 'zustand';
import { shopApi } from '@/lib/api/shop';
import useCompanyStore from './companyStore';
import {
    startOfWeek, endOfWeek,
    startOfMonth, endOfMonth,
    startOfYear, endOfYear,
    format,
} from 'date-fns';

const fmt = (date) => format(date, 'yyyy-MM-dd');

// ─── PRESETS DE DATES ─────────────────────────────────────────────
export const DATE_PRESETS = {
    today: {
        label: "Aujourd'hui",
        getRange: () => {
            const d = new Date();
            return { startDate: fmt(d), endDate: fmt(d) };
        },
    },
    this_week: {
        label: 'Cette semaine',
        getRange: () => ({
            startDate: fmt(startOfWeek(new Date(), { weekStartsOn: 1 })),
            endDate: fmt(endOfWeek(new Date(), { weekStartsOn: 1 })),
        }),
    },
    this_month: {
        label: 'Ce mois',
        getRange: () => ({
            startDate: fmt(startOfMonth(new Date())),
            endDate: fmt(endOfMonth(new Date())),
        }),
    },
    last_30: {
        label: '30 derniers jours',
        getRange: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 29);
            return { startDate: fmt(start), endDate: fmt(end) };
        },
    },
    this_year: {
        label: 'Cette année',
        getRange: () => ({
            startDate: fmt(startOfYear(new Date())),
            endDate: fmt(endOfYear(new Date())),
        }),
    },
    custom: {
        label: 'Personnalisé',
        getRange: () => null, // géré manuellement
    },
};

// ─── STORE ────────────────────────────────────────────────────────
const useShopDashboardStore = create((set, get) => ({
    data: null,
    isLoading: true,

    // Filtre actif
    activePreset: 'this_month',
    dateRange: DATE_PRESETS.this_month.getRange(),

    fetchDashboard: async () => {
        const companyId = useCompanyStore.getState().activeCompany?.id;
        if (!companyId) return;
        const { dateRange } = get();
        set({ isLoading: true });
        try {
            const response = await shopApi.getDashboard(companyId, {
                start_date: dateRange.startDate,
                end_date: dateRange.endDate,
            });
            set({ data: response.data.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    // Changer de preset et recharger
    setPreset: (presetKey) => {
        const preset = DATE_PRESETS[presetKey];
        if (!preset) return;
        const range = preset.getRange();
        if (!range) return; // 'custom' géré via setCustomRange
        set({ activePreset: presetKey, dateRange: range });
        setTimeout(() => get().fetchDashboard(), 0);
    },

    // Plage personnalisée
    setCustomRange: (startDate, endDate) => {
        if (!startDate || !endDate) return;
        set({ activePreset: 'custom', dateRange: { startDate, endDate } });
        setTimeout(() => get().fetchDashboard(), 0);
    },
}));

export default useShopDashboardStore;