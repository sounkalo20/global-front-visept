'use client';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const statuses = [
    { label: 'Tous', value: '' },
    { label: 'En attente', value: 'pending' },
    { label: 'Partiel', value: 'partial' },
    { label: 'Payé', value: 'paid' },
    { label: 'Annulé', value: 'canceled' },
];

export default function DebtFilters({ search, onSearchChange, status, onStatusChange, overdue, onOverdueChange, sortBy, onSortByChange }) {
    const hasFilters = search || status || overdue;

    return (
        <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Rechercher client, téléphone, vente..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <div className="flex gap-1 flex-wrap">
                {statuses.map((s) => (
                    <Button key={s.value} variant={status === s.value ? 'default' : 'outline'} size="sm" onClick={() => onStatusChange(s.value)} className="text-xs h-9">{s.label}</Button>
                ))}
            </div>
            <Button variant={overdue === 'true' ? 'default' : 'outline'} size="sm" onClick={() => onOverdueChange(overdue === 'true' ? '' : 'true')} className={`text-xs h-9 ${overdue === 'true' ? '' : 'border-orange-300 text-orange-600'}`}>
                ⚠ En retard
            </Button>
            <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs">
                <option value="created_at">Plus récent</option>
                <option value="total_amount">Montant ↑</option>
                <option value="remaining_amount">Reste à payer ↑</option>
                <option value="due_date">Échéance</option>
            </select>
            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={() => { onSearchChange(''); onStatusChange(''); onOverdueChange(''); }} className="text-xs h-9">
                    <X size={14} className="mr-1" /> Effacer
                </Button>
            )}
        </div>
    );
}