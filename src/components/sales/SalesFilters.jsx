'use client';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const paymentStatuses = [
    { label: 'Tous', value: '' },
    { label: 'Payé', value: 'paid' },
    { label: 'Partiel', value: 'partial' },
    { label: 'Dette', value: 'debt' },
];

const statuses = [
    { label: 'Tous', value: '' },
    { label: 'Complété', value: 'completed' },
    { label: 'Annulé', value: 'canceled' },
];

export default function SalesFilters({
    search, onSearchChange,
    paymentStatus, onPaymentStatusChange,
    status, onStatusChange,
    dateFilter, onDateFilterChange,
}) {
    const hasFilters = search || paymentStatus || status || dateFilter;

    return (
        <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Rechercher vente, client..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 h-9 text-sm"
                />
            </div>
            <select
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-xs"
            >
                <option value="">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
            </select>
            <div className="flex gap-1">
                {paymentStatuses.map((ps) => (
                    <Button
                        key={ps.value}
                        variant={paymentStatus === ps.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPaymentStatusChange(ps.value)}
                        className="text-xs h-9"
                    >
                        {ps.label}
                    </Button>
                ))}
            </div>
            <div className="flex gap-1">
                {statuses.map((s) => (
                    <Button
                        key={s.value}
                        variant={status === s.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onStatusChange(s.value)}
                        className="text-xs h-9"
                    >
                        {s.label}
                    </Button>
                ))}
            </div>
            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={() => {
                    onSearchChange('');
                    onPaymentStatusChange('');
                    onStatusChange('');
                    onDateFilterChange('');
                }} className="text-xs h-9">
                    <X size={14} className="mr-1" /> Effacer
                </Button>
            )}
        </div>
    );
}