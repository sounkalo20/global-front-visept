'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FileText, Plus, ShoppingCart, CheckCircle2, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCompanyStore from '@/store/companyStore';
import useProformaStore from '@/store/proformaStore';
import useReceiptPrinter from '@/hooks/useReceiptPrinter';
import ProformaFilters from '@/components/proformas/ProformaFilters';
import ProformaTable from '@/components/proformas/ProformaTable';
import ProformaDetailModal from '@/components/proformas/ProformaDetailModal';
import ReceiptPreviewModal from '@/components/sales/receipt/ReceiptPreviewModal';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ProformasPage() {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { proformas, totalProformas, totalPages, isLoading, fetchProformas, fetchProformaById, cancelProforma } = useProformaStore();

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    start_date: '',
    end_date: '',
    page: 1,
  });

  const [selectedProforma, setSelectedProforma] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [printProforma, setPrintProforma] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (activeCompany) {
      fetchProformas(activeCompany.id, filters);
    }
  }, [activeCompany, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      start_date: '',
      end_date: '',
      page: 1,
    });
  };

  const handleView = async (pf) => {
    if (!activeCompany) return;
    const fullProforma = await fetchProformaById(pf.id, activeCompany.id);
    if (fullProforma) {
      setSelectedProforma(fullProforma);
      setIsDetailOpen(true);
    }
  };

  const handlePrint = async (pf) => {
    let targetPf = pf;
    if (!pf.items || pf.items.length === 0) {
      targetPf = await fetchProformaById(pf.id, activeCompany.id);
    }

    if (!targetPf) return;

    const printableFormat = {
      sale_number: targetPf.proforma_number,
      sale_date: targetPf.proforma_date || targetPf.created_at,
      client_name: targetPf.client_full_name || targetPf.client_name || `${targetPf.client_first_name || ''} ${targetPf.client_last_name || ''}`.trim() || 'Client de passage',
      subtotal: parseFloat(targetPf.subtotal),
      discount_amount: parseFloat(targetPf.discount_amount),
      total_amount: parseFloat(targetPf.total_amount),
      amount_paid: 0,
      payment_method: 'none',
      items: (targetPf.items || []).map((item) => ({
        product_name: item.product_name,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price),
      })),
    };

    setPrintProforma(printableFormat);
    setIsPrintModalOpen(true);
  };

  const handleConvertToSale = (pf) => {
    router.push(`/shop/sales/new?proforma_id=${pf.id}`);
  };

  const handleCancel = async (pf) => {
    if (!activeCompany) return;
    if (confirm(`Êtes-vous sûr de vouloir annuler le proforma N° ${pf.proforma_number} ?`)) {
      const res = await cancelProforma(pf.id, activeCompany.id);
      if (res.success) {
        toast.success(`Proforma ${pf.proforma_number} annulé avec succès.`);
        fetchProformas(activeCompany.id, filters);
      } else {
        toast.error(res.message);
      }
    }
  };

  // Calculs des cartes de statistiques rapides locales
  const activeCount = proformas.filter((p) => p.status === 'active').length;
  const convertedCount = proformas.filter((p) => p.status === 'converted').length;
  const totalValued = proformas.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);

  if (!activeCompany) {
    return <LoadingScreen message="Chargement de l'entreprise..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-amber-600" size={28} />
            Factures Proforma
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos propositions commerciales, imprimez les devis et convertissez-les en ventes réelles.
          </p>
        </div>
        <Button
          onClick={() => router.push('/shop/sales/new')}
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl shadow-sm"
        >
          <Plus size={18} className="mr-2" />
          Nouveau Proforma (POS)
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Proformas</p>
            <p className="text-2xl font-bold text-gray-900">{totalProformas}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Actifs / En attente</p>
            <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Convertis en ventes</p>
            <p className="text-2xl font-bold text-purple-700">{convertedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Montant Total Proposé</p>
            <p className="text-xl font-bold text-gray-900 font-mono">
              {totalValued.toLocaleString()} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <ProformaFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Tableau des proformas */}
      {isLoading ? (
        <LoadingScreen message="Chargement des proformas..." />
      ) : (
        <ProformaTable
          proformas={proformas}
          onView={handleView}
          onPrint={handlePrint}
          onConvertToSale={handleConvertToSale}
          onCancel={handleCancel}
        />
      )}

      {/* Modale de détails */}
      <ProformaDetailModal
        proforma={selectedProforma}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onPrint={handlePrint}
      />

      {/* Modale de prévisualisation et réimpression */}
      <ReceiptPreviewModal
        sale={printProforma}
        open={isPrintModalOpen}
        onOpenChange={setIsPrintModalOpen}
        isProforma={true}
      />
    </div>
  );
}
