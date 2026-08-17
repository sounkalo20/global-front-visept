// components/profits/ProfitFilters.jsx
'use client';

import React, { useEffect } from 'react';
import { Calendar, Filter, RefreshCw, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useCategoryStore from '@/store/categoryStore';
import useCompanyStore from '@/store/companyStore';

const PERIOD_PRESETS = [
  { id: 'today', label: "Aujourd'hui" },
  { id: 'yesterday', label: 'Hier' },
  { id: 'this_week', label: 'Cette semaine' },
  { id: 'last_week', label: 'Semaine dernière' },
  { id: 'this_month', label: 'Ce mois' },
  { id: 'last_month', label: 'Mois dernier' },
  { id: 'this_year', label: 'Cette année' },
  { id: 'custom', label: 'Personnalisé' }
];

export default function ProfitFilters({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  isLoading
}) {
  const { categories, fetchCategories } = useCategoryStore();
  const { activeCompany } = useCompanyStore();

  useEffect(() => {
    if (activeCompany?.id) {
      fetchCategories(activeCompany.id);
    }
  }, [activeCompany?.id, fetchCategories]);

  const handlePeriodClick = (presetId) => {
    if (presetId === 'custom') {
      onFilterChange({ period: 'custom' });
    } else {
      onFilterChange({ period: presetId, startDate: '', endDate: '' });
    }
  };

  const hasActiveSecondaryFilters =
    filters.category_id || filters.payment_method || (filters.period === 'custom' && (filters.startDate || filters.endDate));

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-[#374151] p-4 shadow-xs space-y-4">
      {/* 1. Boutons de sélection rapide de période */}
      <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-gray-100 dark:border-[#374151]/60">
        <div className="flex items-center gap-1.5 mr-2 text-xs font-semibold text-gray-500 dark:text-[#9CA3AF]">
          <Calendar size={14} className="text-brand-600 dark:text-brand-400" />
          <span>Période :</span>
        </div>

        {PERIOD_PRESETS.map((preset) => {
          const isActive = filters.period === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handlePeriodClick(preset.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-gray-100/80 dark:bg-[#1F2937]/70 text-gray-600 dark:text-[#D1D5DB] hover:bg-gray-200 dark:hover:bg-[#1F2937]'
              }`}
            >
              {preset.label}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 px-2.5 text-xs border-gray-200 dark:border-[#374151] text-gray-700 dark:text-[#D1D5DB] hover:bg-gray-50 dark:hover:bg-[#1F2937]"
            title="Rafraîchir les analyses"
          >
            <RefreshCw size={13} className={`mr-1.5 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
            Actualiser
          </Button>

          {hasActiveSecondaryFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
              title="Réinitialiser les filtres"
            >
              <X size={13} className="mr-1" />
              Effacer filtres
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filtres secondaires & Dates personnalisées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        {/* Période personnalisée Date début */}
        {filters.period === 'custom' && (
          <>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 dark:text-[#9CA3AF] mb-1 block">
                Date de début
              </label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange({ startDate: e.target.value })}
                className="h-9 text-xs bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-gray-900 dark:text-[#F9FAFB]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-500 dark:text-[#9CA3AF] mb-1 block">
                Date de fin
              </label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange({ endDate: e.target.value })}
                className="h-9 text-xs bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-gray-900 dark:text-[#F9FAFB]"
              />
            </div>
          </>
        )}

        {/* Filtre par Catégorie */}
        <div>
          <label className="text-[11px] font-semibold text-gray-500 dark:text-[#9CA3AF] mb-1 block">
            Filtrer par Catégorie
          </label>
          <select
            value={filters.category_id || ''}
            onChange={(e) => onFilterChange({ category_id: e.target.value })}
            className="flex h-9 w-full rounded-xl border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] px-3 py-1.5 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par Mode de paiement */}
        <div>
          <label className="text-[11px] font-semibold text-gray-500 dark:text-[#9CA3AF] mb-1 block">
            Mode de Paiement
          </label>
          <select
            value={filters.payment_method || ''}
            onChange={(e) => onFilterChange({ payment_method: e.target.value })}
            className="flex h-9 w-full rounded-xl border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] px-3 py-1.5 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          >
            <option value="">Tous les modes</option>
            <option value="cash">Espèces</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="bank_transfer">Virement bancaire</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>
    </div>
  );
}
