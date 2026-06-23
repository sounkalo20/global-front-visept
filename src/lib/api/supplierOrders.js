// lib/api/supplierOrders.js
import api from '@/lib/axios';

export const supplierOrdersApi = {
    // Commandes
    getAll: (companyId, params = {}) =>
        api.get('/supplier-orders', { params: { ...params, company_id: companyId } }),

    getById: (id, companyId) =>
        api.get(`/supplier-orders/${id}`, { params: { company_id: companyId } }),

    create: (data) =>
        api.post('/supplier-orders', data),

    update: (id, data) =>
        api.put(`/supplier-orders/${id}`, data),

    cancel: (id, data) =>
        api.put(`/supplier-orders/${id}/cancel`, data),

    updateStatus: (id, data) =>
        api.put(`/supplier-orders/${id}/status`, data),

    receiveItems: (id, data) =>
        api.put(`/supplier-orders/${id}/receive`, data),

    // Paiements
    addPayment: (orderId, data) =>
        api.post(`/supplier-orders/${orderId}/payments`, data),

    getPayments: (orderId, companyId) =>
        api.get(`/supplier-orders/${orderId}/payments`, { params: { company_id: companyId } }),

    updatePayment: (orderId, paymentId, data) =>
        api.put(`/supplier-orders/${orderId}/payments/${paymentId}`, data),

    deletePayment: (orderId, paymentId, companyId) =>
        api.delete(`/supplier-orders/${orderId}/payments/${paymentId}`, { params: { company_id: companyId } }),

    getAllPayments: (companyId, params = {}) =>
        api.get('/supplier-payments', { params: { ...params, company_id: companyId } }),
};