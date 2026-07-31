import api from '../axios';

export const warehouseApi = {
    // Gestion des entrepôts
    getAll: (company_id) => api.get('/warehouses', { params: { company_id } }),
    getById: (id, company_id) => api.get(`/warehouses/${id}`, { params: { company_id } }),
    create: (data) => api.post('/warehouses', data),
    update: (id, data) => api.put(`/warehouses/${id}`, data),
    delete: (id, company_id) => api.delete(`/warehouses/${id}`, { params: { company_id } }),

    // Stocks et mouvements
    getStocks: (id, company_id) => api.get(`/warehouses/${id}/stocks`, { params: { company_id } }),
    getMovements: (id, company_id) => api.get(`/warehouses/${id}/movements`, { params: { company_id } }),
    getProductStocks: (catalog_product_id, company_id) => api.get(`/warehouses/product/${catalog_product_id}`, { params: { company_id } }),
    getGlobalProductMovements: (catalog_product_id, company_id) => api.get(`/warehouses/product/${catalog_product_id}/movements`, { params: { company_id } }),
    searchGlobalProducts: (query, company_id) => api.get(`/warehouses/search`, { params: { q: query, company_id } }),
    transferToShop: (id, data) => api.post(`/warehouses/${id}/transfer`, data),

    // 🔥 NOUVEAU: Ajustements de stock
    getAdjustmentReasons: () => api.get('/warehouses/adjustment-reasons'),
    adjustStock: (id, data) => api.post(`/warehouses/${id}/adjust-stock`, data),
    getWarehouseAdjustments: (id, params) => api.get(`/warehouses/${id}/adjustments`, { params }),
    getProductAdjustments: (catalog_product_id, params) => api.get(`/products/${catalog_product_id}/adjustments`, { params })
};