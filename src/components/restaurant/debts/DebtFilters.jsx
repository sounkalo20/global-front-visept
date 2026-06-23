// components/restaurant/DebtFilters.jsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export default function DebtFilters({ filters, onFiltersChange }) {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const handleSearch = () => onFiltersChange({ search: searchValue });
    const handleClear = () => { setSearchValue(''); onFiltersChange({ search: '', status: '', overdue: '', start_date: '', end_date: '' }); };
    const hasFilters = filters.search || filters.status || filters.overdue || filters.start_date;

    return (
        <div className="bg-white rounded-xl border p-3">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[180px] flex gap-2">
                    <Input placeholder="Client ou N° commande..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="h-8 text-sm" />
                    <Button variant="outline" size="icon" onClick={handleSearch} className="h-8 w-8"><Search size={14} /></Button>
                </div>

                <Select value={filters.status || 'all'} onValueChange={(v) => onFiltersChange({ status: v === 'all' ? '' : v })}>
                    <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Statut" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="partial">Partiel</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="overdue">En retard</SelectItem>
                    </SelectContent>
                </Select>

                <Input type="date" value={filters.start_date} onChange={(e) => onFiltersChange({ start_date: e.target.value })} className="w-[130px] h-8 text-xs" />
                <Input type="date" value={filters.end_date} onChange={(e) => onFiltersChange({ end_date: e.target.value })} className="w-[130px] h-8 text-xs" />

                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-red-500 h-8 text-xs"><X size={14} className="mr-1" />Effacer</Button>
                )}
            </div>
        </div>
    );
}