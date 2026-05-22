import api from '@/lib/axios';

export const expensesApi = {
  getAll: (companyId, params = {}) =>
    api.get(`/expenses?company_id=${companyId}`, { params }),

  getById: (id, companyId) =>
    api.get(`/expenses/${id}?company_id=${companyId}`),

  create: (data) => api.post('/expenses', data),

  update: (id, data) => api.put(`/expenses/${id}`, data),

  delete: (id, companyId) =>
    api.delete(`/expenses/${id}?company_id=${companyId}`),

  getStats: (companyId, params = {}) =>
    api.get(`/expenses/stats?company_id=${companyId}`, { params }),

  getCategories: (companyId) =>
    api.get(`/expenses/categories?company_id=${companyId}`),
};