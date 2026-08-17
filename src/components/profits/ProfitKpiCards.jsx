// components/profits/ProfitKpiCards.jsx
'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Wallet,
  PieChart,
  Percent,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfitKpiCards({
  summary,
  isLoading,
  onSelectMissingCostFilter
}) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-gray-100 dark:bg-[#1F2937]/50 rounded-2xl animate-pulse border border-gray-200 dark:border-[#374151]"
          />
        ))}
      </div>
    );
  }

  const {
    revenue,
    cogs,
    grossMargin,
    expenses,
    netProfit,
    dataHealth
  } = summary;

  const formatCurrency = (val) => {
    return `${Math.round(val || 0).toLocaleString('fr-FR')} F`;
  };

  const renderTrendBadge = (trend, inverted = false) => {
    if (trend === undefined || trend === null) return null;
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    // Pour les dépenses et les coûts, une baisse (négative) est une bonne chose
    const isGood = inverted ? !isPositive : isPositive;

    if (isNeutral) {
      return (
        <span className="inline-flex items-center text-[10px] font-semibold text-gray-500 dark:text-[#9CA3AF] bg-gray-100 dark:bg-[#1F2937] px-1.5 py-0.5 rounded-md">
          0%
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
          isGood
            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
            : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800'
        }`}
      >
        {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
        {Math.abs(trend)}%
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* ⚠️ Bandeau d'alerte Données Incomplètes si des coûts manquent */}
      {dataHealth?.hasUnpricedProducts && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
              <AlertTriangle size={18} />
            </div>
            <div className="text-xs">
              <p className="font-bold">
                ⚠️ {dataHealth.unpricedProductsCount} produit(s) vendu(s) sans prix d'achat configuré ({formatCurrency(revenue.unpricedRevenue)} de CA)
              </p>
              <p className="text-amber-700 dark:text-amber-300/80 mt-0.5">
                Pour garantir une rentabilité fiable, leur marge n'a pas été surévaluée à 100%. Le calcul couvre{' '}
                <strong>{dataHealth.coveragePercentage}%</strong> de vos ventes évaluables.
              </p>
            </div>
          </div>

          <button
            onClick={onSelectMissingCostFilter}
            className="self-end sm:self-center shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Voir les produits concernés
          </button>
        </div>
      )}

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Chiffre d'Affaires Net */}
        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#9CA3AF]">
                CA Net
              </span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Receipt size={16} />
              </div>
            </div>

            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB]">
                {formatCurrency(revenue.netRevenue)}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500 dark:text-[#9CA3AF]">
                <span>{revenue.salesCount} vente(s)</span>
                {renderTrendBadge(revenue.trend)}
              </div>
            </div>

            <div className="pt-1.5 border-t border-gray-100 dark:border-[#374151]/50 text-[10px] text-gray-500 dark:text-[#9CA3AF] flex justify-between">
              <span>Brut: {formatCurrency(revenue.grossRevenue)}</span>
              {revenue.discounts > 0 && <span className="text-amber-600">Rem: -{formatCurrency(revenue.discounts)}</span>}
            </div>
          </CardContent>
        </Card>

        {/* 2. Coût des Ventes (COGS) */}
        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#9CA3AF]">
                Coût d'Achat (COGS)
              </span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Package size={16} />
              </div>
            </div>

            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB]">
                {formatCurrency(cogs.totalCogs)}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500 dark:text-[#9CA3AF]">
                <span>Marchandises nettes</span>
                {renderTrendBadge(cogs.trend, true)}
              </div>
            </div>

            <div className="pt-1.5 border-t border-gray-100 dark:border-[#374151]/50 text-[10px] text-gray-500 dark:text-[#9CA3AF] flex justify-between">
              <span>Coût historique vente</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Marge Brute */}
        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#9CA3AF]">
                Marge Brute
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={16} />
              </div>
            </div>

            <div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(grossMargin.amount)}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500 dark:text-[#9CA3AF]">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{grossMargin.percentage}%</span>
                {renderTrendBadge(grossMargin.trend)}
              </div>
            </div>

            <div className="pt-1.5 border-t border-gray-100 dark:border-[#374151]/50 text-[10px] text-gray-500 dark:text-[#9CA3AF]">
              <span>CA Net - Coût d'achat</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Dépenses d'Exploitation (OPEX) */}
        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#9CA3AF]">
                Dépenses (OPEX)
              </span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <DollarSign size={16} />
              </div>
            </div>

            <div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(expenses.totalExpenses)}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500 dark:text-[#9CA3AF]">
                <span>{expenses.count} dépense(s)</span>
                {renderTrendBadge(expenses.trend, true)}
              </div>
            </div>

            <div className="pt-1.5 border-t border-gray-100 dark:border-[#374151]/50 text-[10px] text-gray-500 dark:text-[#9CA3AF]">
              <span>Loyer, salaires, charges</span>
            </div>
          </CardContent>
        </Card>

        {/* 5. Bénéfice Net d'Exploitation */}
        <Card className={`border shadow-xs hover:shadow-md transition-shadow ${
          netProfit.amount >= 0
            ? 'bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151]'
            : 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
        }`}>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#9CA3AF]">
                Bénéfice Net
              </span>
              <div className={`p-2 rounded-xl ${
                netProfit.amount >= 0
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                  : 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
              }`}>
                <Wallet size={16} />
              </div>
            </div>

            <div>
              <div className={`text-lg font-bold ${
                netProfit.amount >= 0
                  ? 'text-gray-900 dark:text-[#F9FAFB]'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(netProfit.amount)}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500 dark:text-[#9CA3AF]">
                <span className={`font-semibold ${netProfit.amount >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-600'}`}>
                  Marge nette: {netProfit.percentage}%
                </span>
                {renderTrendBadge(netProfit.trend)}
              </div>
            </div>

            <div className="pt-1.5 border-t border-gray-100 dark:border-[#374151]/50 text-[10px] text-gray-500 dark:text-[#9CA3AF]">
              <span>Marge brute - Dépenses</span>
            </div>
          </CardContent>
        </Card>

        {/* 6. Taux de Marge Globale */}
        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#9CA3AF]">
                Taux de Rentabilité
              </span>
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Percent size={16} />
              </div>
            </div>

            <div>
              <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
                {grossMargin.percentage}%
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500 dark:text-[#9CA3AF]">
                <span>Taux de marge brute</span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-gray-100 dark:border-[#374151]/50 text-[10px] text-gray-500 dark:text-[#9CA3AF]">
              <span>Rendement commercial</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
