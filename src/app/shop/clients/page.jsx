'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Upload, CheckCircle2, EyeOff, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientStats from '@/components/clients/ClientStats';
import ClientFilters from '@/components/clients/ClientFilters';
import ClientTable from '@/components/clients/ClientTable';
import ClientModal from '@/components/clients/ClientModal';
import DeleteClientDialog from '@/components/clients/DeleteClientDialog';
import EmptyClientState from '@/components/clients/EmptyClientState';
import DataImportModal from '@/components/common/DataImportModal';
import DataExportButton from '@/components/common/DataExportButton';
import BulkActionBar from '@/components/common/BulkActionBar';
import BulkConfirmModal from '@/components/common/BulkConfirmModal';
import BulkResultModal from '@/components/common/BulkResultModal';
import ColumnSelector from '@/components/common/ColumnSelector';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { CLIENTS_COLUMNS } from '@/config/tableColumns';
import useClientStore from '@/store/clientStore';
import useCompanyStore from '@/store/companyStore';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';
import {
  Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import PageSizeSelector, { getStoredPageSize } from '@/components/ui/PageSizeSelector';

export default function ClientsPage() {
  const { clients, stats, totalClients, isLoading, fetchClients, fetchStats, totalPages, executeBulkAction } = useClientStore();
  const { activeCompany } = useCompanyStore();

  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);

  const [search, setSearch] = useState(() => searchParams?.get('search') || '');
  const [debtFilter, setDebtFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getStoredPageSize(20));

  // Synchroniser la recherche si l'URL change
  useEffect(() => {
    const urlQuery = searchParams?.get('search');
    if (urlQuery !== null && urlQuery !== undefined) {
      setSearch(urlQuery);
      setPage(1);
    }
  }, [searchParams]);

  // Préférences de colonnes
  const { visibleColumns, toggleColumn, resetToDefaults, hiddenCount } =
    useColumnPreferences('clients', CLIENTS_COLUMNS, activeCompany?.id);

  // Modals pour les Bulk Actions
  const [bulkConfirm, setBulkConfirm] = useState({
    open: false,
    action: null,
    title: '',
    description: '',
    isDestructive: false,
    actionType: 'default',
    warningMessage: null,
  });
  const [isBulkExecuting, setIsBulkExecuting] = useState(false);
  const [bulkResult, setBulkResult] = useState({ open: false, result: null });

  const loadData = useCallback(() => {
    if (activeCompany) {
      fetchClients(activeCompany.id, { search, has_debt: debtFilter, sort_by: sortBy, page, limit: pageSize });
      fetchStats(activeCompany.id);
    }
  }, [activeCompany, search, debtFilter, sortBy, page, pageSize, fetchClients, fetchStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hook de sélection en masse
  const bulkSelection = useBulkSelection(clients);

  // Exécution de l'action en masse
  const handleExecuteBulkAction = async ({ value, inputValue, reason } = {}) => {
    if (!activeCompany || bulkSelection.selectedCount === 0) return;

    setIsBulkExecuting(true);
    const action = bulkConfirm.action;
    const params = {};

    if (action === 'change_city') {
      params.city = inputValue || value || reason;
    } else if (action === 'delete') {
      params.reason = reason;
    }

    const response = await executeBulkAction(activeCompany.id, {
      ids: bulkSelection.selectedIdsArray,
      action,
      params,
    });

    setIsBulkExecuting(false);
    setBulkConfirm((prev) => ({ ...prev, open: false }));

    if (response.success) {
      bulkSelection.clearSelection();
      loadData();
      if (response.data?.skipped_count > 0 || response.data?.failed_count > 0) {
        setBulkResult({ open: true, result: response.data });
      } else {
        toast.success(response.message || `${bulkSelection.selectedCount} client(s) traité(s).`);
      }
    } else {
      toast.error(response.message);
    }
  };

  const bulkPrimaryActions = [
    {
      label: 'Activer',
      icon: CheckCircle2,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'activate',
          actionType: 'activate',
          title: 'Activer les clients sélectionnés',
          description: 'Ces clients redeviendront actifs pour les ventes et le suivi.',
          isDestructive: false,
        });
      },
    },
    {
      label: 'Désactiver',
      icon: EyeOff,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'deactivate',
          actionType: 'deactivate',
          title: 'Désactiver les clients sélectionnés',
          description: 'Ces clients seront archivés mais conserveront tout leur historique d\'achats et dettes.',
          isDestructive: false,
        });
      },
    },
    {
      label: 'Changer la ville',
      icon: MapPin,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'change_city',
          actionType: 'change_city',
          title: 'Définir la ville pour les clients sélectionnés',
          description: 'Renseignez le nom de la ville à affecter aux clients sélectionnés.',
          isDestructive: false,
          confirmLabel: 'Enregistrer la ville',
          showInput: true,
          inputLabel: 'Nom de la nouvelle ville',
          inputPlaceholder: 'Ex: Abidjan, Douala, Dakar, Paris, Lomé...',
          inputRequired: true,
        });
      },
    },
  ];

  const bulkSecondaryActions = [
    {
      label: 'Supprimer les clients éligibles',
      icon: Trash2,
      danger: true,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'delete',
          actionType: 'delete',
          title: 'Supprimer les clients sélectionnés',
          description: 'Les fiches clients seront supprimées uniquement si elles ne comportent aucune dette impayée.',
          isDestructive: true,
          confirmLabel: 'Supprimer',
          warningMessage: 'Règle de sécurité : Tout client ayant une dette en cours ou non régularisée sera systématiquement ignoré et conservé.',
        });
      },
    },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB]">Clients</h1>
          <p className="text-gray-500 dark:text-[#D1D5DB] text-sm">Gérez votre base de clients ({totalClients || clients.length})</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <ColumnSelector
            columnsDef={CLIENTS_COLUMNS}
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
            onReset={resetToDefaults}
            hiddenCount={hiddenCount}
          />
          <DataExportButton moduleName="clients" />
          <HasPermission required="clients.create">
            <Button
              variant="outline"
              onClick={() => setImportModalOpen(true)}
              className="border-brand-200 dark:border-[#374151] text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-[#1F2937] h-9 font-medium"
            >
              <Upload size={16} className="mr-1.5 text-brand-600 dark:text-brand-400" /> Importer
            </Button>
            <Button onClick={() => { setEditingClient(null); setModalOpen(true); }} className="h-9 font-medium bg-brand-600 hover:bg-brand-700 text-white">
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
            selectedIds={bulkSelection.selectedIds}
            onToggleSelect={bulkSelection.toggleSelect}
            onToggleSelectAll={bulkSelection.toggleSelectPage}
            isAllPageSelected={bulkSelection.isAllPageSelected}
            isSomePageSelected={bulkSelection.isSomePageSelected}
            isSelected={bulkSelection.isSelected}
            visibleColumns={visibleColumns}
          />
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <PageSizeSelector value={pageSize} onChange={(size) => { setPageSize(size); setPage(1); }} />
              <div className="text-sm text-gray-500 dark:text-[#D1D5DB]">
                {totalClients || clients.length} client{totalClients > 1 ? 's' : ''} au total
              </div>
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
                    <span className="text-sm text-gray-500 dark:text-[#D1D5DB] mx-4">Page {page} sur {totalPages}</span>
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

      {/* Barre d'actions en masse flottante */}
      <BulkActionBar
        selectedCount={bulkSelection.selectedCount}
        totalCount={totalClients || clients.length}
        isAllPageSelected={bulkSelection.isAllPageSelected}
        onClearSelection={bulkSelection.clearSelection}
        primaryActions={bulkPrimaryActions}
        secondaryActions={bulkSecondaryActions}
        itemName="client"
        itemPlural="clients"
      />

      {/* Modale de confirmation Bulk */}
      <BulkConfirmModal
        isOpen={bulkConfirm.open}
        onClose={() => setBulkConfirm((prev) => ({ ...prev, open: false }))}
        onConfirm={handleExecuteBulkAction}
        title={bulkConfirm.title}
        description={bulkConfirm.description}
        count={bulkSelection.selectedCount}
        actionType={bulkConfirm.actionType}
        isDestructive={bulkConfirm.isDestructive}
        confirmLabel={bulkConfirm.confirmLabel || 'Confirmer'}
        warningMessage={bulkConfirm.warningMessage}
        showInput={bulkConfirm.showInput}
        inputLabel={bulkConfirm.inputLabel}
        inputPlaceholder={bulkConfirm.inputPlaceholder}
        inputRequired={bulkConfirm.inputRequired}
        isLoading={isBulkExecuting}
      />

      {/* Modale de rapport post-exécution */}
      <BulkResultModal
        isOpen={bulkResult.open}
        onClose={() => setBulkResult({ open: false, result: null })}
        result={bulkResult.result}
        title="Résultat de l'action sur les clients"
      />

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