import api from '../axios';

export const warehouseApi = {
    // Gestion des entrepôts
    getAll: () => api.get('/warehouses'),
    getById: (id) => api.get(`/warehouses/${id}`),
    create: (data) => api.post('/warehouses', data),
    update: (id, data) => api.put(`/warehouses/${id}`, data),
    delete: (id) => api.delete(`/warehouses/${id}`),

    // Stocks et mouvements
    getStocks: (id) => api.get(`/warehouses/${id}/stocks`),
    getMovements: (id) => api.get(`/warehouses/${id}/movements`),
    getProductStocks: (catalog_product_id) => api.get(`/warehouses/product/${catalog_product_id}`),
    getGlobalProductMovements: (catalog_product_id) => api.get(`/warehouses/product/${catalog_product_id}/movements`),
    searchGlobalProducts: (query) => api.get(`/warehouses/search`, { params: { q: query } }),
    transferToShop: (id, data) => api.post(`/warehouses/${id}/transfer`, data),

    // 🔥 NOUVEAU: Ajustements de stock
    getAdjustmentReasons: () => api.get('/warehouses/adjustment-reasons'),
    adjustStock: (id, data) => api.post(`/warehouses/${id}/adjust-stock`, data),
    getWarehouseAdjustments: (id, params) => api.get(`/warehouses/${id}/adjustments`, { params }),
    getProductAdjustments: (catalog_product_id, params) => api.get(`/products/${catalog_product_id}/adjustments`, { params })
};