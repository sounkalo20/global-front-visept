'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompanyCard from '@/components/companies/CompanyCard';
import CompanyForm from '@/components/companies/CompanyForm';
import DeleteCompanyDialog from '@/components/companies/DeleteCompanyDialog';
import useCompanyStore from '@/store/companyStore';
import useAuthStore from '@/store/authStore';

export default function CompaniesPage() {
  const { companies, activeCompany, setActiveCompany, fetchCompanies } = useCompanyStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [companyToEdit, setCompanyToEdit] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSwitch = (company) => {
    setActiveCompany(company);
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes entreprises</h1>
            <p className="text-gray-500 mt-1">Gérez vos entreprises et sélectionnez celle sur laquelle travailler.</p>
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
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Dialog de suppression */}
      <DeleteCompanyDialog
        company={companyToDelete}
        open={!!companyToDelete}
        onOpenChange={(open) => !open && setCompanyToDelete(null)}
      />
    </div>
  );
}