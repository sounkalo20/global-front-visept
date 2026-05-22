import api from '@/lib/axios';

export const categoriesApi = {
  getAll: (companyId) => api.get(`/categories?company_id=${companyId}`),

  getById: (id, companyId) => api.get(`/categories/${id}?company_id=${companyId}`),

  create: (data) => api.post('/categories', data),

  update: (id, data) => api.put(`/categories/${id}`, data),

  delete: (id, companyId) => api.delete(`/categories/${id}?company_id=${companyId}`),
};