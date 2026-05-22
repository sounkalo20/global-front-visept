import api from "@/lib/axios";

export const productsApi = {
  getAll: (companyId, params = {}) =>
    api.get(`/products?company_id=${companyId}`, { params }),

  getById: (id, companyId) =>
    api.get(`/products/${id}?company_id=${companyId}`),

  create: (formData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id, companyId) =>
    api.delete(`/products/${id}?company_id=${companyId}`),

  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),

  getMovements: (id, companyId) =>
    api.get(`/products/${id}/movements?company_id=${companyId}`),
};
