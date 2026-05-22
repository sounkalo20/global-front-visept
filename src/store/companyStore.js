import { create } from 'zustand';
import { companiesApi } from '@/lib/api/companies';

const useCompanyStore = create((set, get) => ({
  companies: [],
  activeCompany: null,
  isLoading: false,

  setCompanies: (companies) => {
    set({ companies });
    // Persister dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('visept_companies', JSON.stringify(companies));
    }
  },

  setActiveCompany: (company) => {
    set({ activeCompany: company });
    if (typeof window !== 'undefined' && company) {
      localStorage.setItem('visept_activeCompany', JSON.stringify(company));
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
    // Mettre à jour l'active si nécessaire
    if (get().activeCompany?.id === updatedCompany.id) {
      set({ activeCompany: updatedCompany });
      if (typeof window !== 'undefined') {
        localStorage.setItem('visept_activeCompany', JSON.stringify(updatedCompany));
      }
    }
  },

  deleteCompany: (companyId) => {
    const companies = get().companies.filter((c) => c.id !== companyId);
    set({ companies });
    if (typeof window !== 'undefined') {
      localStorage.setItem('visept_companies', JSON.stringify(companies));
    }
    // Si l'entreprise supprimée était active, switcher sur la première disponible
    if (get().activeCompany?.id === companyId) {
      const newActive = companies.length > 0 ? companies[0] : null;
      set({ activeCompany: newActive });
      if (typeof window !== 'undefined') {
        if (newActive) {
          localStorage.setItem('visept_activeCompany', JSON.stringify(newActive));
        } else {
          localStorage.removeItem('visept_activeCompany');
        }
      }
    }
  },

  fetchCompanies: async () => {
    set({ isLoading: true });
    try {
      const response = await companiesApi.getAll();
      const companies = response.data.data.companies;
      set({ companies, isLoading: false });

      // Définir l'entreprise active automatiquement
      if (companies.length > 0 && !get().activeCompany) {
        const storedActive = typeof window !== 'undefined'
          ? localStorage.getItem('visept_activeCompany')
          : null;

        if (storedActive) {
          try {
            const parsed = JSON.parse(storedActive);
            const exists = companies.find((c) => c.id === parsed.id);
            if (exists) {
              set({ activeCompany: exists });
              return;
            }
          } catch {}
        }
        set({ activeCompany: companies[0] });
      }

      if (companies.length === 0) {
        set({ activeCompany: null });
      }
    } catch {
      set({ isLoading: false });
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
        } catch {}
      }

      if (storedActive) {
        try {
          const active = JSON.parse(storedActive);
          set({ activeCompany: active });
        } catch {}
      }
    }
  },
}));

export default useCompanyStore;