'use client';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientStats from '@/components/clients/ClientStats';
import ClientFilters from '@/components/clients/ClientFilters';
import ClientTable from '@/components/clients/ClientTable';
import ClientModal from '@/components/clients/ClientModal';
import DeleteClientDialog from '@/components/clients/DeleteClientDialog';
import EmptyClientState from '@/components/clients/EmptyClientState';
import useClientStore from '@/store/clientStore';
import useCompanyStore from '@/store/companyStore';

export default function ClientsPage() {
  const { clients, stats, isLoading, fetchClients, fetchStats } = useClientStore();
  const { activeCompany } = useCompanyStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);

  const [search, setSearch] = useState('');
  const [debtFilter, setDebtFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    if (activeCompany) {
      fetchClients(activeCompany.id, { search, has_debt: debtFilter, sort_by: sortBy });
      fetchStats(activeCompany.id);
    }
  }, [activeCompany, search, debtFilter, sortBy]);

  if (!activeCompany) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyClientState onCreate={() => {}} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-500 text-sm">Gérez votre base de clients</p>
        </div>
        {clients.length > 0 && (
          <Button onClick={() => { setEditingClient(null); setModalOpen(true); }}>
            <Plus size={18} className="mr-2" /> Nouveau client
          </Button>
        )}
      </div>

      <ClientStats stats={stats} />

      <ClientFilters
        search={search} onSearchChange={setSearch}
        debtFilter={debtFilter} onDebtFilterChange={setDebtFilter}
        sortBy={sortBy} onSortByChange={setSortBy}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : clients.length === 0 && !search ? (
        <EmptyClientState onCreate={() => setModalOpen(true)} />
      ) : (
        <ClientTable
          clients={clients}
          onEdit={(c) => { setEditingClient(c); setModalOpen(true); }}
          onDelete={setDeletingClient}
        />
      )}

      <ClientModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingClient(null); }}
        client={editingClient}
        onSuccess={() => fetchClients(activeCompany.id, { search, has_debt: debtFilter, sort_by: sortBy })}
      />

      <DeleteClientDialog
        client={deletingClient}
        open={!!deletingClient}
        onOpenChange={(open) => { if (!open) setDeletingClient(null); }}
        onSuccess={() => fetchClients(activeCompany.id, { search, has_debt: debtFilter, sort_by: sortBy })}
      />
    </div>
  );
}