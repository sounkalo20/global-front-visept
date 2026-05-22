import api from "@/lib/axios";

export const debtsApi = {
  getAll: (companyId, params = {}) =>
    api.get(`/debts?company_id=${companyId}`, { params }),

  getById: (id, companyId) => api.get(`/debts/${id}?company_id=${companyId}`),

  create: (data) => api.post("/debts", data),

  update: (id, data) => api.put(`/debts/${id}`, data),

  cancel: (id, companyId) =>
    api.post(`/debts/${id}/cancel`, { company_id: companyId }),

  getStats: (companyId) => api.get(`/debts/stats?company_id=${companyId}`),

  // Paiements
  getPayments: (companyId, params = {}) =>
    api.get(`/debt-payments?company_id=${companyId}`, { params }),

  createPayment: (data) => api.post("/debt-payments", data),

  updatePayment: (id, data) => api.put(`/debt-payments/${id}`, data),

  deletePayment: (id, companyId) =>
    api.delete(`/debt-payments/${id}?company_id=${companyId}`),
};
