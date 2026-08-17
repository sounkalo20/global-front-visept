// app/shop/profits/page.jsx
'use client';

import React, { useEffect, useCallback } from 'react';
import { TrendingUp, Download, Printer, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCompanyStore from '@/store/companyStore';
import useProfitStore from '@/store/profitStore';
import ProfitFilters from '@/components/profits/ProfitFilters';
import ProfitKpiCards from '@/components/profits/ProfitKpiCards';
import ProfitCharts from '@/components/profits/ProfitCharts';
import ProductProfitTable from '@/components/profits/ProductProfitTable';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { toast } from 'sonner';

export default function ProfitAnalysisPage() {
  const { activeCompany } = useCompanyStore();
  const {
    summary,
    evolution,
    categoryProfits,
    productProfits,
    filters,
    setFilters,
    resetFilters,
    fetchAll,
    fetchSummary,
    fetchEvolution,
    fetchCategories,
    fetchProducts,
    isLoadingSummary,
    isLoadingEvolution,
    isLoadingCategories,
    isLoadingProducts,
    error
  } = useProfitStore();

  const isGlobalLoading = isLoadingSummary || isLoadingEvolution || isLoadingCategories || isLoadingProducts;

  // Charger toutes les données lors du changement de compagnie ou de filtres clés
  useEffect(() => {
    if (activeCompany?.id) {
      fetchAll(activeCompany.id);
    }
  }, [activeCompany?.id, filters.period, filters.startDate, filters.endDate, filters.category_id, filters.payment_method]);

  // Recharger uniquement les produits si la recherche, le tri ou la pagination changent
  const handleProductFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    if (activeCompany?.id) {
      fetchProducts(activeCompany.id, newFilters);
    }
  }, [activeCompany?.id, setFilters, fetchProducts]);

  const handleGeneralFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, [setFilters]);

  const handleRefresh = () => {
    if (activeCompany?.id) {
      fetchAll(activeCompany.id);
      toast.success('Données de rentabilité actualisées');
    }
  };

  const handleReset = () => {
    resetFilters();
  };

  // Exporter en CSV la liste des produits avec leurs marges
  const handleExportCSV = () => {
    if (!productProfits?.products || productProfits.products.length === 0) {
      toast.error('Aucune donnée à exporter.');
      return;
    }

    const headers = [
      'Produit',
      'SKU',
      'Catégorie',
      'Quantité Nette',
      'CA Net (FCFA)',
      'Coût Moyen (FCFA)',
      'Coût Total (FCFA)',
      'Marge Brute (FCFA)',
      'Taux de Marge (%)'
    ];

    const rows = productProfits.products.map((p) => [
      `"${p.productName.replace(/"/g, '""')}"`,
      `"${p.sku || ''}"`,
      `"${p.categoryName || ''}"`,
      p.netQuantity,
      p.netRevenue,
      p.isCostKnown ? p.avgUnitCost : 0,
      p.isCostKnown ? p.cogs : 0,
      p.isCostKnown ? p.grossMargin : 0,
      p.isCostKnown ? p.marginPercentage : 'Inconnu'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rentabilite_${activeCompany?.name || 'boutique'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rapport de rentabilité exporté avec succès');
  };

  return (
    <PermissionGuard permission="sales.view_margin">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* En-tête de la page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2.5 text-gray-900 dark:text-[#F9FAFB]">
              <div className="p-2 rounded-xl bg-brand-600 text-white shadow-xs">
                <TrendingUp size={22} />
              </div>
              Bénéfices & Rentabilité
            </h1>
            <p className="text-gray-500 dark:text-[#D1D5DB] text-xs mt-1">
              Centre d'analyse de la marge brute, des coûts d'achat et du bénéfice net d'exploitation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="border-gray-200 dark:border-[#374151] text-xs h-9 text-gray-700 dark:text-[#D1D5DB] hover:bg-gray-50 dark:hover:bg-[#1F2937]"
            >
              <Download size={14} className="mr-1.5" />
              Exporter CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="border-gray-200 dark:border-[#374151] text-xs h-9 text-gray-700 dark:text-[#D1D5DB] hover:bg-gray-50 dark:hover:bg-[#1F2937]"
            >
              <Printer size={14} className="mr-1.5" />
              Imprimer
            </Button>
          </div>
        </div>

        {/* 1. Barre de Filtres */}
        <ProfitFilters
          filters={filters}
          onFilterChange={handleGeneralFilterChange}
          onReset={handleReset}
          onRefresh={handleRefresh}
          isLoading={isGlobalLoading}
        />

        {/* 2. Cartes KPI Synthétiques & Alerte Données Incomplètes */}
        <ProfitKpiCards
          summary={summary}
          isLoading={isLoadingSummary}
          onSelectMissingCostFilter={() => handleProductFilterChange({ filter_type: 'unknown_cost' })}
        />

        {/* 3. Graphiques d'Évolution & Répartition par Catégorie */}
        <ProfitCharts
          evolution={evolution}
          categories={categoryProfits}
          isLoading={isLoadingEvolution || isLoadingCategories}
        />

        {/* 4. Tableau d'Analyse par Produit */}
        <ProductProfitTable
          productsData={productProfits}
          filters={filters}
          onFilterChange={handleProductFilterChange}
          isLoading={isLoadingProducts}
        />
      </div>
    </PermissionGuard>
  );
}
