import axiosInstance from '../axios';

export const returnService = {
  // Obtenir tous les retours
  getReturns: async (params) => {
    const response = await axiosInstance.get('/returns', { params });
    return response.data;
  },

  // Obtenir un retour spécifique
  getReturnById: async (id, companyId) => {
    const response = await axiosInstance.get(`/returns/${id}?company_id=${companyId}`);
    return response.data;
  },

  // Créer un nouveau retour
  createReturn: async (data) => {
    const response = await axiosInstance.post('/returns', data);
    return response.data;
  }
};
