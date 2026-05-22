import { create } from 'zustand';
import { expensesApi } from '@/lib/api/expense';

const useExpenseStore = create((set, get) => ({
  expenses: [],
  expenseDetails: null,
  stats: null,
  categories: [],
  isLoading: false,
  totalExpenses: 0,
  totalPages: 1,

  fetchExpenses: async (companyId, params = {}) => {
    if (!companyId) return;
    set({ isLoading: true });
    try {
      const response = await expensesApi.getAll(companyId, params);
      const { expenses, pagination } = response.data.data;
      set({
        expenses: expenses || [],
        totalExpenses: pagination?.total || 0,
        totalPages: pagination?.pages || 1,
        isLoading: false,
      });
    } catch {
      set({ expenses: [], isLoading: false });
    }
  },

  fetchExpenseById: async (id, companyId) => {
    try {
      const response = await expensesApi.getById(id, companyId);
      set({ expenseDetails: response.data.data.expense });
      return response.data.data.expense;
    } catch {
      return null;
    }
  },

  fetchStats: async (companyId, params = {}) => {
    if (!companyId) return;
    try {
      const response = await expensesApi.getStats(companyId, params);
      set({ stats: response.data.data });
    } catch {}
  },

  fetchCategories: async (companyId) => {
    if (!companyId) return;
    try {
      const response = await expensesApi.getCategories(companyId);
      set({ categories: response.data.data.categories });
    } catch {}
  },

  createExpense: async (data) => {
    try {
      const response = await expensesApi.create(data);
      const expense = response.data.data.expense;
      set((state) => ({ expenses: [expense, ...(state.expenses || [])] }));
      return { success: true, expense };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur création dépense.' };
    }
  },

  updateExpense: async (id, data) => {
    try {
      const response = await expensesApi.update(id, data);
      const updated = response.data.data.expense;
      set((state) => ({
        expenses: (state.expenses || []).map((e) => (e.id === updated.id ? updated : e)),
        expenseDetails: state.expenseDetails?.id === updated.id ? updated : state.expenseDetails,
      }));
      return { success: true, expense: updated };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur modification.' };
    }
  },

  deleteExpense: async (id, companyId) => {
    try {
      await expensesApi.delete(id, companyId);
      set((state) => ({
        expenses: (state.expenses || []).filter((e) => e.id !== id),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur suppression.' };
    }
  },

  clearDetails: () => set({ expenseDetails: null }),
}));

export default useExpenseStore;