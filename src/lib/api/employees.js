import api from '@/lib/axios';

export const getEmployees = async (companyId) => {
    const response = await api.get('/employees', {
        params: { company_id: companyId }
    });
    return response.data;
};

export const createEmployee = async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
};

export const updateEmployee = async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
};

export const deleteEmployee = async (id, companyId) => {
    const response = await api.delete(`/employees/${id}`, {
        params: { company_id: companyId }
    });
    return response.data;
};
