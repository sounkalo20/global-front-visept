import api from '@/lib/axios';

export const clientsApi = {
  getAll: (companyId, params = {}) =>
    api.get(`/clients?company_id=${companyId}`, { params }),

  getById: (id, companyId) =>
    api.get(`/clients/${id}?company_id=${companyId}`),

  create: (data) => api.post('/clients', data),

  update: (id, data) => api.put(`/clients/${id}`, data),

  delete: (id, companyId) =>
    api.delete(`/clients/${id}?company_id=${companyId}`),

  search: (companyId, q) =>
    api.get(`/clients/search?company_id=${companyId}&q=${encodeURIComponent(q)}`),

  getStats: (companyId) =>
    api.get(`/clients/stats?company_id=${companyId}`),
};