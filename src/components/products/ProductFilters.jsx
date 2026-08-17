'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const stockFilters = [
  { label: 'Tous', value: '' },
  { label: 'Stock OK', value: 'ok' },
  { label: 'Stock faible', value: 'low' },
  { label: 'Rupture', value: 'out' },
];

export default function ProductFilters({
  search,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
  sortBy,
  onSortByChange,
  statusFilter,
  onStatusFilterChange,
}) {
  const [localSearch, setLocalSearch] = useState(search || '');

  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  const handleSearch = () => {
    onSearchChange(localSearch);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onStockFilterChange('');
    onSortByChange('created_at');
    if (onStatusFilterChange) onStatusFilterChange('active');
  };

  const hasFilters = search || stockFilter || (statusFilter && statusFilter !== 'active');

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="shrink-0 bg-brand-600 hover:bg-brand-700 text-white">
          Rechercher
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {stockFilters.map((f) => (
          <Button
            key={f.value}
            variant={stockFilter === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStockFilterChange(f.value)}
            className="text-xs"
          >
            {f.label}
          </Button>
        ))}

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="h-9 rounded-xl border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
        >
          <option value="created_at" className="dark:bg-slate-900">Plus récent</option>
          <option value="name" className="dark:bg-slate-900">Nom A→Z</option>
          <option value="retail_price" className="dark:bg-slate-900">Prix ↑</option>
          <option value="current_stock" className="dark:bg-slate-900">Stock ↑</option>
        </select>

        {onStatusFilterChange && (
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-9 rounded-xl border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          >
            <option value="all" className="dark:bg-slate-900">Tous (Actifs & Désactivés)</option>
            <option value="active" className="dark:bg-slate-900">Actifs</option>
            <option value="inactive" className="dark:bg-slate-900">Supprimer</option>
          </select>
        )}

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">
            <X size={14} className="mr-1" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}