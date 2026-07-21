import { create } from 'zustand';
import { warehouseApi } from '@/lib/api/warehouses';

const useWarehouseStore = create((set, get) => ({
    warehouses: [],
    currentWarehouse: null,
    stocks: [],
    movements: [],
    isLoading: false,

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
    }
}));

export default useWarehouseStore;
