'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ClientDetail from '@/components/clients/ClientDetail';
import ClientModal from '@/components/clients/ClientModal';
import useClientStore from '@/store/clientStore';
import useCompanyStore from '@/store/companyStore';

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { clientDetails, fetchClientById, isLoading } = useClientStore();
  const { activeCompany } = useCompanyStore();
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (activeCompany) fetchClientById(id, activeCompany.id);
  }, [id, activeCompany]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!clientDetails) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Client introuvable.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ClientDetail
        client={clientDetails}
        onBack={() => router.push('/restaurant/clients')}
        onEdit={() => setEditOpen(true)}
      />
      <ClientModal
        open={editOpen}
        onOpenChange={setEditOpen}
        client={clientDetails}
        onSuccess={() => fetchClientById(id, activeCompany.id)}
      />
    </div>
  );
}