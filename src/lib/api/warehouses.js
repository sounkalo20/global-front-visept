import api from '../axios';

export const warehouseApi = {
    getAll: () => api.get('/warehouses'),
    getById: (id) => api.get(`/warehouses/${id}`),
    create: (data) => api.post('/warehouses', data),
    update: (id, data) => api.put(`/warehouses/${id}`, data),
    delete: (id) => api.delete(`/warehouses/${id}`),
    
    getStocks: (id) => api.get(`/warehouses/${id}/stocks`),
    getMovements: (id) => api.get(`/warehouses/${id}/movements`),
    getProductStocks: (catalog_product_id) => api.get(`/warehouses/product/${catalog_product_id}`),
    transferToShop: (id, data) => api.post(`/warehouses/${id}/transfer`, data)
};
