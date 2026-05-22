'use client';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const debtFilters = [
    { label: 'Tous', value: '' },
    { label: 'Avec dette', value: 'true' },
];

export default function ClientFilters({
    search, onSearchChange,
    debtFilter, onDebtFilterChange,
    sortBy, onSortByChange,
}) {
    const hasFilters = search || debtFilter;

    return (
        <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Rechercher nom, téléphone, email..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 h-9 text-sm"
                />
            </div>
            <div className="flex gap-1">
                {debtFilters.map((f) => (
                    <Button
                        key={f.value}
                        variant={debtFilter === f.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onDebtFilterChange(f.value)}
                        className="text-xs h-9"
                    >
                        {f.label}
                    </Button>
                ))}
            </div>
            <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs"
            >
                <option value="created_at">Plus récent</option>
                <option value="full_name">Nom A→Z</option>
                <option value="total_purchases">Top achats</option>
                <option value="current_debt">Plus endetté</option>
                <option value="last_purchase_at">Dernier achat</option>
            </select>
            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={() => { onSearchChange(''); onDebtFilterChange(''); }} className="text-xs h-9">
                    <X size={14} className="mr-1" /> Effacer
                </Button>
            )}
        </div>
    );
}