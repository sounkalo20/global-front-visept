'use client';
import { useEffect, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientStats from '@/components/clients/ClientStats';
import ClientFilters from '@/components/clients/ClientFilters';
import ClientTable from '@/components/clients/ClientTable';
import ClientModal from '@/components/clients/ClientModal';
import DeleteClientDialog from '@/components/clients/DeleteClientDialog';
import EmptyClientState from '@/components/clients/EmptyClientState';
import DataImportModal from '@/components/common/DataImportModal';
import DataExportButton from '@/components/common/DataExportButton';
import useClientStore from '@/store/clientStore';
import useCompanyStore from '@/store/companyStore';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';
import {
  Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import PageSizeSelector, { getStoredPageSize } from '@/components/ui/PageSizeSelector';

export default function ClientsPage() {
  const { clients, stats, isLoading, fetchClients, fetchStats, totalPages } = useClientStore();
  const { activeCompany } = useCompanyStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);

  const [search, setSearch] = useState('');
  const [debtFilter, setDebtFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getStoredPageSize(20));

  const loadData = () => {
    if (activeCompany) {
      fetchClients(activeCompany.id, { search, has_debt: debtFilter, sort_by: sortBy, page, limit: pageSize });
      fetchStats(activeCompany.id);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCompany, search, debtFilter, sortBy, page, pageSize]);

  if (!activeCompany) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyClientState onCreate={() => {}} />
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="clients.view">
      <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-500 text-sm">Gérez votre base de clients</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <DataExportButton moduleName="clients" />
          <HasPermission required="clients.create">
            <Button
              variant="outline"
              onClick={() => setImportModalOpen(true)}
              className="border-brand-200 text-brand-700 hover:bg-brand-50 h-9 font-medium"
            >
              <Upload size={16} className="mr-1.5 text-brand-600" /> Importer
            </Button>
            <Button onClick={() => { setEditingClient(null); setModalOpen(true); }} className="h-9 font-medium">
              <Plus size={18} className="mr-1.5" /> Nouveau client
            </Button>
          </HasPermission>
        </div>
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
        <EmptyClientState onCreate={() => setModalOpen(true)} onImport={() => setImportModalOpen(true)} />
      ) : (
        <>
          <ClientTable
            clients={clients}
            onEdit={(c) => { setEditingClient(c); setModalOpen(true); }}
            onDelete={setDeletingClient}
            viewLink="/shop/clients"
          />
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <PageSizeSelector value={pageSize} onChange={(size) => { setPageSize(size); setPage(1); }} />
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm text-gray-500 mx-4">Page {page} sur {totalPages}</span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      <ClientModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingClient(null); }}
        client={editingClient}
        onSuccess={loadData}
      />

      <DeleteClientDialog
        client={deletingClient}
        open={!!deletingClient}
        onOpenChange={(open) => { if (!open) setDeletingClient(null); }}
        onSuccess={loadData}
      />

      <DataImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        moduleName="clients"
        onSuccess={loadData}
      />
    </div>
    </PermissionGuard>
  );
}