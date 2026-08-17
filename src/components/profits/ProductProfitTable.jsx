// components/profits/ProductProfitTable.jsx
'use client';

import React from 'react';
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Package,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function ProductProfitTable({
  productsData,
  filters,
  onFilterChange,
  isLoading
}) {
  const router = useRouter();
  const { products = [], pagination = { total: 0, page: 1, limit: 50, totalPages: 1 } } = productsData || {};

  const formatCurrency = (val) => {
    return `${Math.round(val || 0).toLocaleString('fr-FR')} F`;
  };

  const handleTabChange = (type) => {
    onFilterChange({ filter_type: type, page: 1 });
  };

  const handleSortChange = (sortBy) => {
    onFilterChange({ sort_by: sortBy, page: 1 });
  };

  const renderMarginBadge = (product) => {
    if (!product.isCostKnown) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-[#1F2937] text-gray-600 dark:text-[#9CA3AF] border border-gray-200 dark:border-[#374151]" title="Prix d'achat non configuré (0 F)">
          <HelpCircle size={11} className="text-amber-500" />
          Non renseigné
        </span>
      );
    }

    if (product.grossMargin < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          {product.marginPercentage}% (Négative)
        </span>
      );
    }

    if (product.marginPercentage <= 15) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {product.marginPercentage}% (Faible)
        </span>
      );
    }

    if (product.marginPercentage <= 30) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {product.marginPercentage}%
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        {product.marginPercentage}%
      </span>
    );
  };

  return (
    <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#374151]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB] flex items-center gap-2">
            <Package size={18} className="text-brand-600 dark:text-brand-400" />
            Analyse de Rentabilité par Produit
          </CardTitle>
          <p className="text-xs text-gray-500 dark:text-[#9CA3AF] mt-0.5">
            Détail des marges, coûts d'achat et volumes par article ({pagination.total} articles)
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom, SKU..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="pl-8 h-9 text-xs bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-gray-900 dark:text-[#F9FAFB]"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Onglets de filtrage rapide + Sélecteur de tri */}
        <div className="p-3 bg-gray-50/80 dark:bg-[#1F2937]/40 border-b border-gray-100 dark:border-[#374151]/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-3 py-1 rounded-xl font-medium transition-all ${
                filters.filter_type === 'all'
                  ? 'bg-white dark:bg-[#111827] text-brand-600 dark:text-brand-400 shadow-xs border border-gray-200 dark:border-[#374151]'
                  : 'text-gray-600 dark:text-[#D1D5DB] hover:bg-gray-200/60 dark:hover:bg-[#1F2937]'
              }`}
            >
              Tous ({pagination.total})
            </button>

            <button
              onClick={() => handleTabChange('profitable')}
              className={`px-3 py-1 rounded-xl font-medium transition-all ${
                filters.filter_type === 'profitable'
                  ? 'bg-white dark:bg-[#111827] text-emerald-600 dark:text-emerald-400 shadow-xs border border-gray-200 dark:border-[#374151]'
                  : 'text-gray-600 dark:text-[#D1D5DB] hover:bg-gray-200/60 dark:hover:bg-[#1F2937]'
              }`}
            >
              🏆 Top Rentables
            </button>

            <button
              onClick={() => handleTabChange('low_or_negative')}
              className={`px-3 py-1 rounded-xl font-medium transition-all ${
                filters.filter_type === 'low_or_negative'
                  ? 'bg-white dark:bg-[#111827] text-amber-600 dark:text-amber-400 shadow-xs border border-gray-200 dark:border-[#374151]'
                  : 'text-gray-600 dark:text-[#D1D5DB] hover:bg-gray-200/60 dark:hover:bg-[#1F2937]'
              }`}
            >
              ⚠️ Marges Faibles / Négatives
            </button>

            <button
              onClick={() => handleTabChange('unknown_cost')}
              className={`px-3 py-1 rounded-xl font-medium transition-all ${
                filters.filter_type === 'unknown_cost'
                  ? 'bg-white dark:bg-[#111827] text-red-600 dark:text-red-400 shadow-xs border border-gray-200 dark:border-[#374151]'
                  : 'text-gray-600 dark:text-[#D1D5DB] hover:bg-gray-200/60 dark:hover:bg-[#1F2937]'
              }`}
            >
              ❓ Coût Non Renseigné
            </button>
          </div>

          {/* Tri */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-[#9CA3AF] text-[11px]">Trier par :</span>
            <select
              value={filters.sort_by || 'margin_desc'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-8 rounded-lg border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] px-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none"
            >
              <option value="margin_desc">Bénéfice (Plus élevé)</option>
              <option value="margin_asc">Bénéfice (Plus faible)</option>
              <option value="margin_pct_desc">Taux de marge %</option>
              <option value="revenue_desc">Chiffre d'affaires</option>
              <option value="quantity_desc">Volume vendu</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50/80 dark:bg-[#1F2937]/80 text-gray-500 dark:text-[#D1D5DB] uppercase text-[11px] border-b border-gray-200 dark:border-[#374151]">
              <tr>
                <th className="px-4 py-3 font-semibold">Produit</th>
                <th className="px-4 py-3 font-semibold">Catégorie</th>
                <th className="px-4 py-3 text-right font-semibold">Qté Nette</th>
                <th className="px-4 py-3 text-right font-semibold">CA Net</th>
                <th className="px-4 py-3 text-right font-semibold">Coût Moyen</th>
                <th className="px-4 py-3 text-right font-semibold">Coût Total (COGS)</th>
                <th className="px-4 py-3 text-right font-semibold">Marge Brute</th>
                <th className="px-4 py-3 text-center font-semibold">Taux Marge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="8" className="px-4 py-3.5">
                      <div className="h-4 bg-gray-100 dark:bg-[#1F2937]/60 rounded-md animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-gray-500 dark:text-[#9CA3AF]">
                    Aucun produit trouvé pour ces critères de filtrage.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.productId}
                    className="hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-[#F9FAFB]">
                      <div className="flex flex-col">
                        <span>{p.productName}</span>
                        {p.sku && <span className="text-[10px] text-gray-400 font-normal">SKU: {p.sku}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-[#D1D5DB]">
                      {p.categoryName}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-[#D1D5DB]">
                      <span>{p.netQuantity}</span>
                      {p.returnedQuantity > 0 && (
                        <span className="block text-[10px] text-red-500 font-normal">
                          (-{p.returnedQuantity} retours)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-[#F9FAFB]">
                      {formatCurrency(p.netRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-[#D1D5DB]">
                      {p.isCostKnown ? formatCurrency(p.avgUnitCost) : <span className="text-amber-500 italic">Inconnu</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-purple-600 dark:text-purple-400 font-medium">
                      {p.isCostKnown ? formatCurrency(p.cogs) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {p.isCostKnown ? (
                        <span
                          className={
                            p.grossMargin < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }
                        >
                          {formatCurrency(p.grossMargin)}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderMarginBadge(p)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-3 border-t border-gray-100 dark:border-[#374151]/60 flex items-center justify-between text-xs text-gray-500 dark:text-[#9CA3AF]">
            <span>
              Page {pagination.page} sur {pagination.totalPages} ({pagination.total} articles)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
                className="h-8 w-8 p-0 border-gray-200 dark:border-[#374151]"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
                className="h-8 w-8 p-0 border-gray-200 dark:border-[#374151]"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
