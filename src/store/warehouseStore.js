import { create } from 'zustand';
import { warehouseApi } from '@/lib/api/warehouses';
import useCompanyStore from './companyStore';

const useWarehouseStore = create((set, get) => ({
    // État
    warehouses: [],
    currentWarehouse: null,
    stocks: [],
    movements: [],
    adjustments: [],
    adjustmentReasons: [],
    isLoading: false,
    pagination: null,

    // ─── GESTION DES ENTREPÔTS ──────────────────────────
    fetchWarehouses: async () => {
        set({ isLoading: true });
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const res = await warehouseApi.getAll(companyId);
            set({ warehouses: res.data.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
        }
    },

    getWarehouseById: async (id) => {
        set({ isLoading: true });
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const res = await warehouseApi.getById(id, companyId);
            set({ currentWarehouse: res.data.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
        }
    },

    createWarehouse: async (data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await warehouseApi.create({ ...data, company_id: companyId });
            get().fetchWarehouses();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    updateWarehouse: async (id, data) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await warehouseApi.update(id, { ...data, company_id: companyId });
            get().fetchWarehouses();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    deleteWarehouse: async (id) => {
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            await warehouseApi.delete(id, companyId);
            get().fetchWarehouses();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    // ─── STOCKS ET MOUVEMENTS ────────────────────────────
    fetchWarehouseStocks: async (id) => {
        set({ isLoading: true });
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const res = await warehouseApi.getStocks(id, companyId);
            set({ stocks: res.data.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
        }
    },

    fetchWarehouseMovements: async (id) => {
        set({ isLoading: true });
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const res = await warehouseApi.getMovements(id, companyId);
            set({ movements: res.data.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
        }
    },

    transferToShop: async (id, data) => {
        try {
            await warehouseApi.transferToShop(id, data);
            get().fetchWarehouseStocks(id);
            get().fetchWarehouseMovements(id);
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    fetchProductWarehouseStocks: async (catalogProductId) => {
        set({ isLoading: true });
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const res = await warehouseApi.getProductStocks(catalogProductId, companyId);
            set({ isLoading: false });
            return res.data.data;
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
            return [];
        }
    },

    // ─── 🔥 NOUVEAU: AJUSTEMENTS DE STOCK ──────────────
    fetchAdjustmentReasons: async () => {
        try {
            const res = await warehouseApi.getAdjustmentReasons();
            set({ adjustmentReasons: res.data.data });
            return res.data.data;
        } catch (error) {
            console.error('Erreur chargement motifs:', error);
            return [];
        }
    },

    adjustStock: async (warehouseId, data) => {
        try {
            const res = await warehouseApi.adjustStock(warehouseId, data);
            // Rafraîchir les données
            get().fetchWarehouseStocks(warehouseId);
            get().fetchWarehouseMovements(warehouseId);
            return res.data.data;
        } catch (error) {
            console.error('Erreur ajustement:', error);
            throw error;
        }
    },

    fetchWarehouseAdjustments: async (warehouseId, params = {}) => {
        set({ isLoading: true });
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const res = await warehouseApi.getWarehouseAdjustments(warehouseId, { ...params, company_id: companyId });
            set({
                adjustments: res.data.data,
                pagination: res.data.pagination,
                isLoading: false
            });
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
        }
    },

    fetchProductAdjustments: async (catalogProductId, params = {}) => {
        set({ isLoading: true });
        try {
            const companyId = useCompanyStore.getState().activeCompany?.id;
            const res = await warehouseApi.getProductAdjustments(catalogProductId, { ...params, company_id: companyId });
            set({
                adjustments: res.data.data,
                pagination: res.data.pagination,
                isLoading: false
            });
            return res.data.data;
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
            return [];
        }
    },

    // ─── RÉINITIALISATION ─────────────────────────────────
    reset: () => {
        set({
            warehouses: [],
            currentWarehouse: null,
            stocks: [],
            movements: [],
            adjustments: [],
            adjustmentReasons: [],
            isLoading: false,
            pagination: null
        });
    }
}));

export default useWarehouseStore;