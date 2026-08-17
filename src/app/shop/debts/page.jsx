'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DebtStats from '@/components/debts/DebtStats';
import DebtFilters from '@/components/debts/DebtFilters';
import DebtTable from '@/components/debts/DebtTable';
import EmptyDebtState from '@/components/debts/EmptyDebtState';
import ExportDebtsPDFDialog from '@/components/debts/ExportDebtsPDFDialog';
import BulkActionBar from '@/components/common/BulkActionBar';
import ColumnSelector from '@/components/common/ColumnSelector';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { DEBTS_COLUMNS } from '@/config/tableColumns';
import useDebtStore from '@/store/debtStore';
import useCompanyStore from '@/store/companyStore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import {
  Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import PageSizeSelector, { getStoredPageSize } from '@/components/ui/PageSizeSelector';

export default function DebtsPage() {
  const { debts, stats, totalPages, isLoading, fetchDebts, fetchStats } = useDebtStore();
  const { activeCompany } = useCompanyStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(() => searchParams?.get('search') || '');
  const [status, setStatus] = useState('');
  const [overdue, setOverdue] = useState('');
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
    useColumnPreferences('debts', DEBTS_COLUMNS, activeCompany?.id);

  const loadData = useCallback(() => {
    if (activeCompany) {
      const params = { sort_by: sortBy, page, limit: pageSize };
      if (search) params.search = search;
      if (status) params.status = status;
      if (overdue) params.overdue = overdue;
      fetchDebts(activeCompany.id, params);
      fetchStats(activeCompany.id);
    }
  }, [activeCompany, search, status, overdue, sortBy, page, pageSize, fetchDebts, fetchStats]);

  useEffect(() => { loadData(); }, [loadData]);

  // Hook de sélection en masse
  const bulkSelection = useBulkSelection(debts);

  // Exporter en CSV les dettes sélectionnées
  const handleExportSelectedCSV = () => {
    const selectedDebts = (debts || []).filter((d) => bulkSelection.isSelected(d.id));
    if (selectedDebts.length === 0) return;

    const headers = ['Client', 'Téléphone', 'N° Vente', 'Montant Total (FCFA)', 'Montant Payé (FCFA)', 'Reste à Payer (FCFA)', 'Statut', 'Date d\'échéance'];
    const rows = selectedDebts.map((d) => [
      d.client_name || 'Inconnu',
      d.client_phone || '',
      d.sale_number || `#${d.id}`,
      d.total_amount || 0,
      d.total_paid || 0,
      d.remaining_amount || 0,
      d.status || '',
      d.due_date ? new Date(d.due_date).toLocaleDateString('fr-FR') : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dettes_selection_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${selectedDebts.length} dette(s) exportée(s) en CSV.`);
  };

  // Exporter en PDF les dettes sélectionnées
  const handleExportSelectedPDF = () => {
    const selectedDebts = (debts || []).filter((d) => bulkSelection.isSelected(d.id));
    if (selectedDebts.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`État des dettes sélectionnées - ${activeCompany?.name || 'VISEPT'}`, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - Total : ${selectedDebts.length} dettes`, 14, 25);

    const tableData = selectedDebts.map((d) => [
      d.client_name || 'Inconnu',
      d.client_phone || '-',
      d.sale_number || `#${d.id}`,
      `${parseInt(d.total_amount || 0).toLocaleString()} F`,
      `${parseInt(d.remaining_amount || 0).toLocaleString()} F`,
      d.status === 'paid' ? 'Soldée' : d.status === 'partial' ? 'Partielle' : 'En attente',
      d.due_date ? new Date(d.due_date).toLocaleDateString('fr-FR') : '-',
    ]);

    autoTable(doc, {
      head: [['Client', 'Contact', 'Vente', 'Total', 'Reste à payer', 'Statut', 'Échéance']],
      body: tableData,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    });

    doc.save(`etat_dettes_selection_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success(`Rapport PDF généré pour ${selectedDebts.length} dette(s).`);
  };

  const bulkPrimaryActions = [
    {
      label: 'Exporter en CSV',
      icon: Download,
      onClick: handleExportSelectedCSV,
    },
    {
      label: 'Rapport PDF',
      icon: FileText,
      onClick: handleExportSelectedPDF,
    },
  ];

  if (!activeCompany) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyDebtState onCreate={() => { }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB]">Dettes clients</h1>
          <p className="text-gray-500 dark:text-[#D1D5DB] text-sm">Suivi des ventes à crédit ({debts?.length || 0})</p>
        </div>
        <div className="flex items-center gap-3">
          <ColumnSelector
            columnsDef={DEBTS_COLUMNS}
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
            onReset={resetToDefaults}
            hiddenCount={hiddenCount}
          />
          <ExportDebtsPDFDialog />
          <Button onClick={() => router.push('/shop/debts/new')} className="bg-brand-600 hover:bg-brand-700 text-white">
            <Plus size={18} className="mr-2" /> Nouvelle vente à crédit
          </Button>
        </div>
      </div>

      <DebtStats stats={stats} />

      <DebtFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(1); }}
        overdue={overdue}
        onOverdueChange={(v) => { setOverdue(v); setPage(1); }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : !debts || debts.length === 0 ? (
        <EmptyDebtState onCreate={() => router.push('/shop/debts/new')} />
      ) : (
        <>
          <DebtTable
            debts={debts}
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
        totalCount={debts?.length || 0}
        isAllPageSelected={bulkSelection.isAllPageSelected}
        onClearSelection={bulkSelection.clearSelection}
        primaryActions={bulkPrimaryActions}
        itemName="dette"
        itemPlural="dettes"
      />
    </div>
  );
}

