import api from '@/lib/axios';

export const companiesApi = {
  getAll: () => api.get('/companies'),

  getById: (id) => api.get(`/companies/${id}`),

  create: (formData) =>
    api.post('/companies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, formData) =>
    api.put(`/companies/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id) => api.delete(`/companies/${id}`),
};