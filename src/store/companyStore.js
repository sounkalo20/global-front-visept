// store/companyStore.js
import { create } from 'zustand';
import { companiesApi } from '@/lib/api/companies';

const useCompanyStore = create((set, get) => ({
  companies: [],
  activeCompany: null,
  isLoading: false,
  isFetched: false, // ← AJOUTÉ : pour éviter les refetch inutiles

  setCompanies: (companies) => {
    set({ companies });
    if (typeof window !== 'undefined') {
      localStorage.setItem('visept_companies', JSON.stringify(companies));
    }
  },

  setActiveCompany: (company) => {
    set({ activeCompany: company });
    if (typeof window !== 'undefined' && company) {
      localStorage.setItem('visept_activeCompany', JSON.stringify(company));
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('visept_activeCompany');
    }
  },

  addCompany: (company) => {
    const companies = [...get().companies, company];
    set({ companies });
    if (typeof window !== 'undefined') {
      localStorage.setItem('visept_companies', JSON.stringify(companies));
    }
  },

  updateCompany: (updatedCompany) => {
    const companies = get().companies.map((c) =>
      c.id === updatedCompany.id ? updatedCompany : c
    );
    set({ companies });
    if (typeof window !== 'undefined') {
      localStorage.setItem('visept_companies', JSON.stringify(companies));
    }
    if (get().activeCompany?.id === updatedCompany.id) {
      set({ activeCompany: updatedCompany });
      if (typeof window !== 'undefined') {
        localStorage.setItem('visept_activeCompany', JSON.stringify(updatedCompany));
      }
    }
  },

  deleteCompany: (companyId) => {
    const companies = get().companies.filter((c) => c.id !== companyId);
    const newActive = get().activeCompany?.id === companyId
      ? (companies.length > 0 ? companies[0] : null)
      : get().activeCompany;

    set({ companies, activeCompany: newActive });

    if (typeof window !== 'undefined') {
      localStorage.setItem('visept_companies', JSON.stringify(companies));
      if (newActive) {
        localStorage.setItem('visept_activeCompany', JSON.stringify(newActive));
      } else {
        localStorage.removeItem('visept_activeCompany');
      }
    }
  },

  fetchCompanies: async () => {
    // Éviter les appels multiples simultanés
    if (get().isLoading) return;

    set({ isLoading: true });
    try {
      const response = await companiesApi.getAll();
      const companies = response.data.data.companies;

      // Déterminer l'active company AVANT le set
      let activeCompany = null;

      if (companies.length > 0) {
        // Essayer de récupérer depuis le localStorage
        const storedActive = typeof window !== 'undefined'
          ? localStorage.getItem('visept_activeCompany')
          : null;

        if (storedActive) {
          try {
            const parsed = JSON.parse(storedActive);
            activeCompany = companies.find((c) => c.id === parsed.id) || null;
          } catch {
            activeCompany = null;
          }
        }

        // Fallback : première entreprise
        if (!activeCompany) {
          activeCompany = companies[0];
        }
      }

      // UN SEUL set pour tout mettre à jour
      set({
        companies,
        activeCompany,
        isLoading: false,
        isFetched: true,
      });
    } catch {
      set({ isLoading: false, isFetched: true });
    }
  },

  initCompanies: () => {
    if (typeof window !== 'undefined') {
      const storedCompanies = localStorage.getItem('visept_companies');
      const storedActive = localStorage.getItem('visept_activeCompany');

      if (storedCompanies) {
        try {
          const companies = JSON.parse(storedCompanies);
          set({ companies });
        } catch { }
      }

      if (storedActive) {
        try {
          const active = JSON.parse(storedActive);
          set({ activeCompany: active });
        } catch { }
      }
    }
  },
}));

export default useCompanyStore;