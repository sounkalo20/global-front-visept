// store/profitStore.js
import { create } from 'zustand';
import axios from '@/lib/axios';

const useProfitStore = create((set, get) => ({
  // Données
  summary: null,
  evolution: [],
  categoryProfits: [],
  productProfits: {
    products: [],
    pagination: { total: 0, page: 1, limit: 50, totalPages: 1 }
  },

  // Filtres
  filters: {
    period: 'this_month',
    startDate: '',
    endDate: '',
    category_id: '',
    seller_id: '',
    payment_method: '',
    search: '',
    filter_type: 'all', // 'all' | 'profitable' | 'low_or_negative' | 'unknown_cost'
    sort_by: 'margin_desc',
    page: 1,
    limit: 50
  },

  // États de chargement
  isLoadingSummary: false,
  isLoadingEvolution: false,
  isLoadingCategories: false,
  isLoadingProducts: false,
  error: null,

  // Définir les filtres
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page !== undefined ? newFilters.page : 1 }
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        period: 'this_month',
        startDate: '',
        endDate: '',
        category_id: '',
        seller_id: '',
        payment_method: '',
        search: '',
        filter_type: 'all',
        sort_by: 'margin_desc',
        page: 1,
        limit: 50
      }
    });
  },

  // Construire la query string
  getQueryString: (companyId, customFilters = {}) => {
    const activeFilters = { ...get().filters, ...customFilters };
    const params = new URLSearchParams();
    params.append('company_id', companyId);

    if (activeFilters.period) params.append('period', activeFilters.period);
    if (activeFilters.period === 'custom') {
      if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
      if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);
    }
    if (activeFilters.category_id) params.append('category_id', activeFilters.category_id);
    if (activeFilters.seller_id) params.append('seller_id', activeFilters.seller_id);
    if (activeFilters.payment_method) params.append('payment_method', activeFilters.payment_method);
    if (activeFilters.search) params.append('search', activeFilters.search);
    if (activeFilters.filter_type) params.append('filter_type', activeFilters.filter_type);
    if (activeFilters.sort_by) params.append('sort_by', activeFilters.sort_by);
    if (activeFilters.page) params.append('page', activeFilters.page);
    if (activeFilters.limit) params.append('limit', activeFilters.limit);

    return params.toString();
  },

  // 1. Récupérer la synthèse
  fetchSummary: async (companyId) => {
    if (!companyId) return;
    set({ isLoadingSummary: true, error: null });
    try {
      const queryString = get().getQueryString(companyId);
      const res = await axios.get(`/profits/summary?${queryString}`);
      if (res.data.success) {
        set({ summary: res.data.data, isLoadingSummary: false });
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Erreur lors du chargement de la synthèse de rentabilité',
        isLoadingSummary: false
      });
    }
  },

  // 2. Récupérer l'évolution temporelle
  fetchEvolution: async (companyId) => {
    if (!companyId) return;
    set({ isLoadingEvolution: true, error: null });
    try {
      const queryString = get().getQueryString(companyId);
      const res = await axios.get(`/profits/evolution?${queryString}`);
      if (res.data.success) {
        set({ evolution: res.data.data, isLoadingEvolution: false });
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Erreur lors du chargement de l'évolution",
        isLoadingEvolution: false
      });
    }
  },

  // 3. Récupérer la rentabilité par catégorie
  fetchCategories: async (companyId) => {
    if (!companyId) return;
    set({ isLoadingCategories: true, error: null });
    try {
      const queryString = get().getQueryString(companyId);
      const res = await axios.get(`/profits/categories?${queryString}`);
      if (res.data.success) {
        set({ categoryProfits: res.data.data, isLoadingCategories: false });
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Erreur lors du chargement des catégories',
        isLoadingCategories: false
      });
    }
  },

  // 4. Récupérer les produits
  fetchProducts: async (companyId, overrideFilters = {}) => {
    if (!companyId) return;
    set({ isLoadingProducts: true, error: null });
    try {
      const queryString = get().getQueryString(companyId, overrideFilters);
      const res = await axios.get(`/profits/products?${queryString}`);
      if (res.data.success) {
        set({ productProfits: res.data.data, isLoadingProducts: false });
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Erreur lors du chargement des produits',
        isLoadingProducts: false
      });
    }
  },

  // Tout charger en parallèle
  fetchAll: async (companyId) => {
    if (!companyId) return;
    await Promise.all([
      get().fetchSummary(companyId),
      get().fetchEvolution(companyId),
      get().fetchCategories(companyId),
      get().fetchProducts(companyId)
    ]);
  }
}));

export default useProfitStore;
