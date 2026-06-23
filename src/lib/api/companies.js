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


  update: (id, formData) => api.put(`/companies/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  requestUpgrade: (companyId, formData) =>
    api.post(`/companies/${companyId}/subscription/upgrade`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getInvoices: (companyId) =>
    api.get(`/companies/${companyId}/invoices`),

  getPaymentProofs: (companyId) =>
    api.get(`/companies/${companyId}/payment-proofs`),
};