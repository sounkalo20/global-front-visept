// components/restaurant/SaleFilters.jsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export default function SaleFilters({ filters, onFiltersChange }) {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const handleSearch = () => onFiltersChange({ search: searchValue });
    const handleClear = () => {
        setSearchValue('');
        onFiltersChange({
            search: '', start_date: '', end_date: '', client_id: '',
            status: '', payment_status: '',
        });
    };
    const hasFilters = filters.search || filters.start_date || filters.end_date || filters.status || filters.payment_status;

    return (
        <div className="bg-white rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] flex gap-2">
                    <Input
                        placeholder="N° commande ou client..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button variant="outline" size="icon" onClick={handleSearch}><Search size={16} /></Button>
                </div>

                <Input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => onFiltersChange({ start_date: e.target.value })}
                    className="w-[150px]"
                />
                <Input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => onFiltersChange({ end_date: e.target.value })}
                    className="w-[150px]"
                />

                <Select value={filters.payment_status || 'all'} onValueChange={(v) => onFiltersChange({ payment_status: v === 'all' ? '' : v })}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Paiement" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="debt">Dette</SelectItem>
                        <SelectItem value="partial">Partiel</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filters.status || 'all'} onValueChange={(v) => onFiltersChange({ status: v === 'all' ? '' : v })}>
                    <SelectTrigger className="w-[150px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="completed">Complétée</SelectItem>
                        <SelectItem value="canceled">Annulée</SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button variant="ghost" onClick={handleClear} className="text-red-500">
                        <X size={16} className="mr-1" />Effacer
                    </Button>
                )}
            </div>
        </div>
    );
}