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

  delete: (id, companyId, data = {}) =>
    api.delete(`/products/${id}?company_id=${companyId}`, { data }),

  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),

  getMovements: (id, companyId) =>
    api.get(`/products/${id}/movements?company_id=${companyId}`),

  getCompositions: (productId, companyId) =>
    api.get(`/products/${productId}/compositions`, { params: { company_id: companyId } }),

  updateCompositions: (productId, data) =>
    api.put(`/products/${productId}/compositions`, data),

  reactivate: (id, companyId) =>
    api.post(`/products/${id}/reactivate?company_id=${companyId}`),

  bulkAction: (companyId, { ids, action, params = {} }) =>
    api.post(`/products/bulk?company_id=${companyId}`, { ids, action, params }),
};
