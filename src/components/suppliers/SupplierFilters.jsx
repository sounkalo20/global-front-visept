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
        <div className="bg-white rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] flex gap-2">
                    <Input
                        placeholder="Rechercher un fournisseur..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button variant="outline" size="icon" onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => onFiltersChange({ status: value === 'all' ? '' : value })}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actifs</SelectItem>
                        <SelectItem value="inactive">Inactifs</SelectItem>
                        <SelectItem value="with_debt">Avec dette</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters && (
                    <Button variant="ghost" onClick={handleClearFilters} className="text-red-500">
                        <X size={16} className="mr-1" /> Effacer
                    </Button>
                )}
            </div>
        </div>
    );
}