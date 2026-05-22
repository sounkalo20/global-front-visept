import { create } from 'zustand';
import { categoriesApi } from '@/lib/api/categories';

const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (companyId) => {
    if (!companyId) {
      set({ categories: [], isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await categoriesApi.getAll(companyId);
      set({ categories: response.data.data.categories, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement des catégories.',
        isLoading: false,
      });
    }
  },

  addCategory: async (data) => {
    try {
      const response = await categoriesApi.create(data);
      const newCategory = response.data.data.category;

      set((state) => ({
        categories: [...state.categories, { ...newCategory, children: [], children_count: 0 }],
      }));

      return { success: true, category: newCategory };
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de la création.";
      return { success: false, message };
    }
  },

  updateCategory: async (id, data) => {
    try {
      const response = await categoriesApi.update(id, data);
      const updatedCategory = response.data.data.category;

      set((state) => ({
        categories: state.categories.map((cat) =>
          cat.id === updatedCategory.id
            ? { ...cat, ...updatedCategory, children: cat.children }
            : cat
        ),
      }));

      return { success: true, category: updatedCategory };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la modification.';
      return { success: false, message };
    }
  },

  deleteCategory: async (id, companyId) => {
    try {
      await categoriesApi.delete(id, companyId);

      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
      }));

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la suppression.';
      return { success: false, message };
    }
  },

  clearCategories: () => set({ categories: [], isLoading: false, error: null }),
}));

export default useCategoryStore;