import api from '../axios';

export const authApi = {
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  
  updatePassword: async (data) => {
    const response = await api.put('/auth/password', data);
    return response.data;
  }
};
