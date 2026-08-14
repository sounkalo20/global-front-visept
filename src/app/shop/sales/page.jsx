'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SalesStats from '@/components/sales/SalesStats';
import SalesFilters from '@/components/sales/SalesFilters';
import SalesTable from '@/components/sales/SalesTable';
import ExportSalesPDFDialog from '@/components/sales/ExportSalesPDFDialog';
import BulkActionBar from '@/components/common/BulkActionBar';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import useSaleStore from '@/store/saleStore';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PageSizeSelector, { getStoredPageSize } from "@/components/ui/PageSizeSelector";
import useCompanyStore from '@/store/companyStore';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';
import { toast } from 'sonner';

export default function SalesPage() {
  const { sales, stats, totalPages, isLoading, fetchSales, fetchStats } = useSaleStore();
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [status, setStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getStoredPageSize(20));

  useEffect(() => {
    if (activeCompany) {
      const params = { search, payment_status: paymentStatus, status, page, limit: pageSize };
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.start_date = today;
        params.end_date = today;
      }
      fetchSales(activeCompany.id, params);
      fetchStats(activeCompany.id);
    }
  }, [activeCompany, search, paymentStatus, status, dateFilter, page, pageSize, fetchSales, fetchStats]);

  // Hook de sélection en masse
  const bulkSelection = useBulkSelection(sales);

  // Exporter en CSV les ventes sélectionnées
  const handleExportSelectedCSV = () => {
    const selectedSales = sales.filter((s) => bulkSelection.isSelected(s.id));
    if (selectedSales.length === 0) return;

    const headers = ['N° Vente', 'Date', 'Client', 'Articles', 'Total (FCFA)', 'Statut Paiement', 'Statut Vente', 'Vendeur'];
    const rows = selectedSales.map((s) => [
      s.sale_number,
      new Date(s.sale_date).toLocaleDateString('fr-FR'),
      s.client_first_name ? `${s.client_first_name} ${s.client_last_name}` : s.client_name || 'Client passager',
      s.items_count || 0,
      s.total_amount,
      s.payment_status,
      s.status,
      s.seller_name || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ventes_selection_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${selectedSales.length} vente(s) exportée(s) en CSV.`);
  };

  // Exporter en PDF les ventes sélectionnées
  const handleExportSelectedPDF = () => {
    const selectedSales = sales.filter((s) => bulkSelection.isSelected(s.id));
    if (selectedSales.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Rapport des ventes sélectionnées - ${activeCompany?.name || 'VISEPT'}`, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - Total : ${selectedSales.length} ventes`, 14, 25);

    const tableData = selectedSales.map((s) => [
      s.sale_number,
      new Date(s.sale_date).toLocaleDateString('fr-FR'),
      s.client_first_name ? `${s.client_first_name} ${s.client_last_name}` : s.client_name || 'Client passager',
      s.items_count || 0,
      `${parseInt(s.total_amount).toLocaleString()} FCFA`,
      s.payment_status === 'paid' ? 'Payé' : s.payment_status === 'partial' ? 'Partiel' : 'Impayé',
    ]);

    autoTable(doc, {
      head: [['N° Vente', 'Date', 'Client', 'Articles', 'Total', 'Paiement']],
      body: tableData,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`rapport_ventes_selection_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success(`Rapport PDF généré pour ${selectedSales.length} vente(s).`);
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

  return (
    <PermissionGuard requiredPermission="sales.view">
      <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB]">Ventes</h1>
          <p className="text-gray-500 dark:text-[#D1D5DB] text-sm">Historique et gestion des ventes ({sales.length})</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportSalesPDFDialog />
          <HasPermission required="sales.create">
            <Button onClick={() => router.push('/shop/sales/new')} size="lg" className="bg-brand-600 hover:bg-brand-700 text-white">
              <Plus size={20} className="mr-2" /> Nouvelle vente
            </Button>
          </HasPermission>
        </div>
      </div>

      <SalesStats stats={stats} />

      <SalesFilters
        search={search} onSearchChange={setSearch}
        paymentStatus={paymentStatus} onPaymentStatusChange={setPaymentStatus}
        status={status} onStatusChange={setStatus}
        dateFilter={dateFilter} onDateFilterChange={setDateFilter}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <SalesTable
            sales={sales}
            selectedIds={bulkSelection.selectedIds}
            onToggleSelect={bulkSelection.toggleSelect}
            onToggleSelectAll={bulkSelection.toggleSelectPage}
            isAllPageSelected={bulkSelection.isAllPageSelected}
            isSomePageSelected={bulkSelection.isSomePageSelected}
            isSelected={bulkSelection.isSelected}
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
                    <span className="text-sm text-gray-500 dark:text-[#D1D5DB] mx-4">
                      Page {page} sur {totalPages}
                    </span>
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
        totalCount={sales.length}
        isAllPageSelected={bulkSelection.isAllPageSelected}
        onClearSelection={bulkSelection.clearSelection}
        primaryActions={bulkPrimaryActions}
        itemName="vente"
        itemPlural="ventes"
      />
    </div>
    </PermissionGuard>
  );
}