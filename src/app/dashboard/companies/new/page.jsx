'use client';
import CompanyForm from '@/components/companies/CompanyForm';

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Créer une entreprise</h1>
      <CompanyForm />
    </div>
  );
}