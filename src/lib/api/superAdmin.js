// lib/api/superAdmin.js
import api from '@/lib/axios';

export const superAdminApi = {
    // Dashboard
    getStats: () => api.get('/super-admin/dashboard/stats'),

    // Companies
    getCompanies: (params = {}) => api.get('/super-admin/companies', { params }),
    getCompanyStats: () => api.get('/super-admin/companies/stats'),
    getCompanyDetail: (id) => api.get(`/super-admin/companies/${id}`),
    suspendCompany: (id, data = {}) => api.put(`/super-admin/companies/${id}/suspend`, data),
    reactivateCompany: (id) => api.put(`/super-admin/companies/${id}/reactivate`),

    // Payments
    getPendingPayments: (params = {}) => api.get('/super-admin/payments/pending', { params }),
    approvePayment: (id) => api.put(`/super-admin/payments/${id}/approve`),
    rejectPayment: (id, data) => api.put(`/super-admin/payments/${id}/reject`, data),

    // Plans
    getPlans: (params = {}) => api.get('/super-admin/plans', { params }),
    getPlanStats: () => api.get('/super-admin/plans/stats'),
    getPlanDetail: (id) => api.get(`/super-admin/plans/${id}`),
    createPlan: (data) => api.post('/super-admin/plans', data),
    updatePlan: (id, data) => api.put(`/super-admin/plans/${id}`, data),
    deletePlan: (id) => api.delete(`/super-admin/plans/${id}`),
    togglePlanStatus: (id) => api.put(`/super-admin/plans/${id}/toggle-status`),
};