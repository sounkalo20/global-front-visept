// components/suppliers/SupplierFilters.jsx
'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export default function SupplierFilters({ filters, onFiltersChange }) {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const handleSearch = () => {
        onFiltersChange({ search: searchValue });
    };

    const handleClearFilters = () => {
        setSearchValue('');
        onFiltersChange({ search: '', status: '' });
    };

    const hasActiveFilters = filters.search || filters.status;

    return (
        <div className="bg-white dark:bg-[#111827] rounded-xl border border-gray-200 dark:border-[#374151] p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] flex gap-2">
                    <Input
                        placeholder="Rechercher un fournisseur..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-gray-900 dark:text-[#F9FAFB]"
                    />
                    <Button variant="outline" size="icon" onClick={handleSearch} className="border-gray-200 dark:border-[#374151] hover:bg-gray-100 dark:hover:bg-[#1F2937]">
                        <Search size={16} className="text-gray-500 dark:text-[#D1D5DB]" />
                    </Button>
                </div>

                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => onFiltersChange({ status: value === 'all' ? '' : value })}
                >
                    <SelectTrigger className="w-[180px] bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-gray-900 dark:text-[#F9FAFB]">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#1F2937] border-gray-200 dark:border-[#374151]">
                        <SelectItem value="all" className="text-gray-900 dark:text-[#F9FAFB]">Tous les statuts</SelectItem>
                        <SelectItem value="active" className="text-gray-900 dark:text-[#F9FAFB]">Actifs</SelectItem>
                        <SelectItem value="inactive" className="text-gray-900 dark:text-[#F9FAFB]">Inactifs</SelectItem>
                        <SelectItem value="with_debt" className="text-gray-900 dark:text-[#F9FAFB]">Avec dette</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button variant="ghost" onClick={handleClearFilters} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <X size={16} className="mr-1" /> Effacer
                    </Button>
                )}
            </div>
        </div>
    );
}