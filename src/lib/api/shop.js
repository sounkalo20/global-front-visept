// lib/api/shop.js (NOUVEAU)
import api from '@/lib/axios';

export const shopApi = {
    getDashboard: (companyId) =>
        api.get('/shop/dashboard', { params: { company_id: companyId } }),
};