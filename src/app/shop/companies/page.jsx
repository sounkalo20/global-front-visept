// app/companies/page.jsx (REMPLACER)
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompanyCard from '@/components/companies/CompanyCard';
import CompanyForm from '@/components/companies/CompanyForm';
import CompanyEditForm from '@/components/companies/CompanyEditForm';
import SubscriptionUpgradeModal from '@/components/companies/SubscriptionUpgradeModal';
import DeleteCompanyDialog from '@/components/companies/DeleteCompanyDialog';
import useCompanyStore from '@/store/companyStore';

export default function CompaniesPage() {
  const companies = useCompanyStore((s) => s.companies);
  const activeCompany = useCompanyStore((s) => s.activeCompany);
  const isLoading = useCompanyStore((s) => s.isLoading);
  const isFetched = useCompanyStore((s) => s.isFetched);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);
  const fetchCompanies = useCompanyStore((s) => s.fetchCompanies);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [companyToEdit, setCompanyToEdit] = useState(null);
  const [companyToUpgrade, setCompanyToUpgrade] = useState(null);
  const router = useRouter();
  const didFetch = useRef(false);

  useEffect(() => {
    if (!didFetch.current && !isFetched && !isLoading) {
      didFetch.current = true;
      fetchCompanies();
    }
  }, [isFetched, isLoading, fetchCompanies]);

  const handleSwitch = (company) => {
    setActiveCompany(company);
    // router.push('/shop/dashboard');
  };

  if (isLoading || !isFetched) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes entreprises</h1>
            <p className="text-gray-500 mt-1">
              Gérez vos entreprises et sélectionnez celle sur laquelle travailler.
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus size={18} className="mr-2" />
            Nouvelle entreprise
          </Button>
        </div>

        {showCreateForm && (
          <div className="mb-8">
            <CompanyForm />
          </div>
        )}

        {companies.length === 0 && !showCreateForm ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-500">Aucune entreprise pour le moment.</p>
            <Button onClick={() => setShowCreateForm(true)} className="mt-4">
              <Plus size={18} className="mr-2" />
              Créer une entreprise
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                isActive={activeCompany?.id === company.id}
                myRole={company.my_role}
                onSwitch={handleSwitch}
                onEdit={(c) => setCompanyToEdit(c)}
                onDelete={(c) => setCompanyToDelete(c)}
                onUpgrade={(c) => setCompanyToUpgrade(c)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <CompanyEditForm
        isOpen={!!companyToEdit}
        onClose={() => setCompanyToEdit(null)}
        company={companyToEdit}
      />

      <SubscriptionUpgradeModal
        isOpen={!!companyToUpgrade}
        onClose={() => setCompanyToUpgrade(null)}
        company={companyToUpgrade}
      />

      <DeleteCompanyDialog
        company={companyToDelete}
        open={!!companyToDelete}
        onOpenChange={(open) => !open && setCompanyToDelete(null)}
      />
    </div>
  );
}