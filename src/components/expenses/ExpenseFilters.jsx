'use client';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ExpenseFilters({
  search, onSearchChange,
  category, onCategoryChange,
  paymentMethod, onPaymentMethodChange,
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  sortBy, onSortByChange,
  categories,
}) {
  const hasFilters = search || category || paymentMethod || startDate || endDate;

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('');
    onPaymentMethodChange('');
    onStartDateChange('');
    onEndDateChange('');
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Rechercher une dépense..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories?.slice(0, 6).map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category === cat.value ? '' : cat.value)}
              className="text-xs h-9"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={paymentMethod} onChange={(e) => onPaymentMethodChange(e.target.value)} className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs">
          <option value="">Tous les paiements</option>
          <option value="cash">Cash</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="bank_transfer">Virement</option>
        </select>
        <Input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className="h-9 w-36 text-xs" placeholder="Du" />
        <Input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} className="h-9 w-36 text-xs" placeholder="Au" />
        <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs">
          <option value="expense_date">Plus récent</option>
          <option value="amount">Montant ↑</option>
          <option value="title">Titre A→Z</option>
        </select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-9"><X size={14} className="mr-1" /> Effacer</Button>
        )}
      </div>
    </div>
  );
}