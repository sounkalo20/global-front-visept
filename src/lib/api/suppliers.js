// lib/api/suppliers.js
import api from '@/lib/axios';

export const suppliersApi = {
    getAll: (companyId, params = {}) =>
        api.get('/suppliers', { params: { ...params, company_id: companyId } }),

    getById: (id, companyId) =>
        api.get(`/suppliers/${id}`, { params: { company_id: companyId } }),

    create: (data) =>
        api.post('/suppliers', data),

    update: (id, data) =>
        api.put(`/suppliers/${id}`, data),

    delete: (id, companyId) =>
        api.delete(`/suppliers/${id}`, { params: { company_id: companyId } }),

    toggleStatus: (id, companyId) =>
        api.put(`/suppliers/${id}/toggle-status`, { company_id: companyId }),
};