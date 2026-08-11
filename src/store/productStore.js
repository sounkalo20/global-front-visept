import { create } from "zustand";
import { productsApi } from "@/lib/api/products";

const useProductStore = create((set, get) => ({
  products: [],
  posProducts: [],
  totalProducts: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,

  fetchProducts: async (companyId, params = {}) => {
    if (!companyId) {
      set({ products: [], isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getAll(companyId, params);
      const { products, pagination } = response.data.data;
      set({
        products,
        totalProducts: pagination.total,
        totalPages: pagination.pages,
        currentPage: pagination.page,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement.",
        isLoading: false,
      });
    }
  },

  fetchPosProducts: async (companyId) => {
    if (!companyId) {
      set({ posProducts: [], isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await productsApi.getAll(companyId, { limit: 'all', is_active: 'true' });
      const { products } = response.data.data;
      set({
        posProducts: products,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Erreur lors du chargement (POS).",
        isLoading: false,
      });
    }
  },

  addProduct: async (formData) => {
    try {
      const response = await productsApi.create(formData);
      const product = response.data.data.product;
      set((state) => ({ products: [product, ...state.products] }));
      return { success: true, product };
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur création produit.";
      return { success: false, message };
    }
  },

  updateProduct: async (id, formData) => {
    try {
      const response = await productsApi.update(id, formData);
      const updated = response.data.data.product;
      set((state) => ({
        products: state.products.map((p) =>
          p.id === updated.id ? updated : p,
        ),
      }));
      return { success: true, product: updated };
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur modification produit.";
      return { success: false, message };
    }
  },

  deleteProduct: async (id, companyId, options = {}) => {
    try {
      await productsApi.delete(id, companyId, options);
      // Au lieu de supprimer la ligne, on met is_active à 0
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, is_active: 0 } : p
        ),
      }));
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur suppression produit.";
      return { success: false, message };
    }
  },

  reactivateProduct: async (id, companyId) => {
    try {
      await productsApi.reactivate(id, companyId);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? { ...p, is_active: 1 } : p
        ),
      }));
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors de la réactivation.";
      return { success: false, message };
    }
  },

  updateStock: async (id, companyId, data) => {
    try {
      const response = await productsApi.updateStock(id, {
        company_id: companyId,
        ...data,
      });
      const updated = response.data.data.product;
      set((state) => ({
        products: state.products.map((p) =>
          p.id === updated.id ? updated : p,
        ),
      }));
      return { success: true, product: updated };
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur mise à jour stock.";
      return { success: false, message };
    }
  },

  clearProducts: () => set({ products: [], posProducts: [], isLoading: false, error: null }),
}));

export default useProductStore;
