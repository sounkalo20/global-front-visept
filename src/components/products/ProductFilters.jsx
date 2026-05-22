'use client';
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
}) {
  const clearFilters = () => {
    onSearchChange('');
    onStockFilterChange('');
    onSortByChange('created_at');
  };

  const hasFilters = search || stockFilter;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
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
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="created_at">Plus récent</option>
          <option value="name">Nom A→Z</option>
          <option value="retail_price">Prix ↑</option>
          <option value="current_stock">Stock ↑</option>
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-500">
            <X size={14} className="mr-1" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}