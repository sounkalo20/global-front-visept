import { create } from 'zustand';
import { warehouseApi } from '@/lib/api/warehouses';

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
            const res = await warehouseApi.getAll();
            set({ warehouses: res.data.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
        }
    },

    getWarehouseById: async (id) => {
        set({ isLoading: true });
        try {
            const res = await warehouseApi.getById(id);
            set({ currentWarehouse: res.data.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
        }
    },

    createWarehouse: async (data) => {
        try {
            await warehouseApi.create(data);
            get().fetchWarehouses();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    updateWarehouse: async (id, data) => {
        try {
            await warehouseApi.update(id, data);
            get().fetchWarehouses();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    deleteWarehouse: async (id) => {
        try {
            await warehouseApi.delete(id);
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
            const res = await warehouseApi.getStocks(id);
            set({ stocks: res.data.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error(error);
        }
    },

    fetchWarehouseMovements: async (id) => {
        set({ isLoading: true });
        try {
            const res = await warehouseApi.getMovements(id);
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
            const res = await warehouseApi.getProductStocks(catalogProductId);
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
            const res = await warehouseApi.getWarehouseAdjustments(warehouseId, params);
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
            const res = await warehouseApi.getProductAdjustments(catalogProductId, params);
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