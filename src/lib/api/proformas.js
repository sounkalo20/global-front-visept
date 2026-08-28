import api from '@/lib/axios';

export const proformasApi = {
  getAll: (companyId, params = {}) =>
    api.get(`/proformas?company_id=${companyId}`, { params }),

  getById: (id, companyId) =>
    api.get(`/proformas/${id}?company_id=${companyId}`),

  create: (data) => api.post('/proformas', data),

  update: (id, data) => api.put(`/proformas/${id}`, data),

  cancel: (id, companyId) =>
    api.post(`/proformas/${id}/cancel?company_id=${companyId}`),
};
