// lib/api/shop.js
import api from '@/lib/axios';

export const shopApi = {
    getDashboard: (companyId, dateParams = {}) =>
        api.get('/shop/dashboard', { params: { company_id: companyId, ...dateParams } }),
};