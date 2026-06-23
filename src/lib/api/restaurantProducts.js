// lib/api/restaurantProducts.js (NOUVEAU)
import api from '@/lib/axios';

export const restaurantProductsApi = {
    getAll: (companyId, params = {}) =>
        api.get('/restaurant/products', { params: { ...params, company_id: companyId } }),

    getById: (id, companyId) =>
        api.get(`/restaurant/products/${id}`, { params: { company_id: companyId } }),

    create: (data) =>
        api.post('/restaurant/products', data),

    update: (id, data) =>
        api.put(`/restaurant/products/${id}`, data),

    delete: (id, companyId) =>
        api.delete(`/restaurant/products/${id}`, { params: { company_id: companyId } }),
};