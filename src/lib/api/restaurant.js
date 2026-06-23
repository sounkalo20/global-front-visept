// lib/api/restaurant.js
import api from '@/lib/axios';

export const restaurantApi = {
    // Dashboard
    getDashboard: (companyId) =>
        api.get('/restaurant/dashboard', { params: { company_id: companyId } }),

    // Dishes
    getDishes: (companyId, params = {}) =>
        api.get('/restaurant/dishes', { params: { ...params, company_id: companyId } }),

    getDishById: (id, companyId) =>
        api.get(`/restaurant/dishes/${id}`, { params: { company_id: companyId } }),

    createDish: (formData) =>
        api.post('/restaurant/dishes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    updateDish: (id, formData) =>
        api.put(`/restaurant/dishes/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    deleteDish: (id, companyId) =>
        api.delete(`/restaurant/dishes/${id}`, { params: { company_id: companyId } }),

    toggleAvailability: (id, companyId) =>
        api.put(`/restaurant/dishes/${id}/toggle-availability`, { company_id: companyId }),

    // Sales
    getSales: (companyId, params = {}) =>
        api.get('/restaurant/sales', { params: { ...params, company_id: companyId } }),

    getSaleById: (id, companyId) =>
        api.get(`/restaurant/sales/${id}`, { params: { company_id: companyId } }),

    getSalesStats: (companyId) =>
        api.get('/restaurant/sales/stats', { params: { company_id: companyId } }),

    createSale: (data) =>
        api.post('/restaurant/sales', data),

    updateSale: (id, data) =>
        api.put(`/restaurant/sales/${id}`, data),

    cancelSale: (id, data) =>
        api.put(`/restaurant/sales/${id}/cancel`, data),

    // Debts
    getDebts: (companyId, params = {}) =>
        api.get('/restaurant/debts', { params: { ...params, company_id: companyId } }),

    getDebtById: (id, companyId) =>
        api.get(`/restaurant/debts/${id}`, { params: { company_id: companyId } }),

    getDebtStats: (companyId) =>
        api.get('/restaurant/debts/stats', { params: { company_id: companyId } }),

    createDebt: (data) =>
        api.post('/restaurant/debts', data),

    updateDebt: (id, data) =>
        api.put(`/restaurant/debts/${id}`, data),

    cancelDebt: (id, companyId) =>
        api.put(`/restaurant/debts/${id}/cancel`, { company_id: companyId }),

    // Payments
    getPayments: (companyId, params = {}) =>
        api.get('/restaurant/payments', { params: { ...params, company_id: companyId } }),

    createPayment: (data) =>
        api.post('/restaurant/payments', data),

    updatePayment: (id, data) =>
        api.put(`/restaurant/payments/${id}`, data),

    deletePayment: (id, companyId) =>
        api.delete(`/restaurant/payments/${id}`, { params: { company_id: companyId } }),

    getDashboard: (companyId) =>
        api.get('/restaurant/dashboard', { params: { company_id: companyId } }),
};