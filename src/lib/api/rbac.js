import api from '../axios';

export const getSystemPermissions = async () => {
    const response = await api.get('/rbac/permissions');
    return response.data;
};

export const getRoles = async (companyId) => {
    const response = await api.get(`/rbac/${companyId}/roles`);
    return response.data;
};

export const createRole = async (companyId, data) => {
    const response = await api.post(`/rbac/${companyId}/roles`, data);
    return response.data;
};

export const updateRole = async (companyId, roleId, data) => {
    const response = await api.put(`/rbac/${companyId}/roles/${roleId}`, data);
    return response.data;
};

export const deleteRole = async (companyId, roleId) => {
    const response = await api.delete(`/rbac/${companyId}/roles/${roleId}`);
    return response.data;
};
