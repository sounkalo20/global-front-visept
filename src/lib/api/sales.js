import api from '@/lib/axios';

export const salesApi = {
  getAll: (companyId, params = {}) =>
    api.get(`/sales?company_id=${companyId}`, { params }),

  getById: (id, companyId) =>
    api.get(`/sales/${id}?company_id=${companyId}`),

  create: (data) => api.post('/sales', data),

  update: (id, data) => api.put(`/sales/${id}`, data),

  cancel: (id, data) => api.post(`/sales/${id}/cancel`, data),

  getStats: (companyId) =>
    api.get(`/sales/stats?company_id=${companyId}`),
};