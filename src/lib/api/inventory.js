import api from '../axios';

export const inventoryApi = {
  // Dashboard
  getDashboard: (company_id) => api.get('/inventories/dashboard/stats', { params: { company_id } }),

  // Sessions
  getSessions: (company_id, params = {}) => api.get('/inventories', { params: { company_id, ...params } }),
  getSession: (id, company_id) => api.get(`/inventories/${id}`, { params: { company_id } }),
  createSession: (data) => api.post('/inventories', data),

  // Cycle de vie
  startSession: (id, company_id) => api.put(`/inventories/${id}/start`, { company_id }),
  completeSession: (id, company_id) => api.put(`/inventories/${id}/complete`, { company_id }),
  resumeSession: (id, company_id) => api.put(`/inventories/${id}/resume`, { company_id }),
  validateSession: (id, company_id) => api.put(`/inventories/${id}/validate`, { company_id }),
  cancelSession: (id, company_id) => api.put(`/inventories/${id}/cancel`, { company_id }),

  // Items
  updateItem: (sessionId, itemId, data) => api.put(`/inventories/${sessionId}/items/${itemId}`, data),
};
