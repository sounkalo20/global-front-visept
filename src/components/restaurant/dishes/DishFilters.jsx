// components/restaurant/DishFilters.jsx
'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import useCompanyStore from '@/store/companyStore';
import { categoriesApi } from '@/lib/api/categories';

export default function DishFilters({ filters, onFiltersChange }) {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [categories, setCategories] = useState([]);
    const activeCompany = useCompanyStore((s) => s.activeCompany);

    useEffect(() => {
        if (activeCompany?.id) {
            categoriesApi.getAll(activeCompany.id)
                .then(r => setCategories(r.data.data.categories || []))
                .catch(() => { });
        }
    }, [activeCompany]);

    const handleSearch = () => onFiltersChange({ search: searchValue });
    const handleClear = () => {
        setSearchValue('');
        onFiltersChange({ search: '', category_id: '', is_available: '' });
    };
    const hasFilters = filters.search || filters.category_id || filters.is_available;

    return (
        <div className="bg-white rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] flex gap-2">
                    <Input
                        placeholder="Rechercher un plat..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button variant="outline" size="icon" onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                <Select
                    value={filters.category_id || 'all'}
                    onValueChange={(v) => onFiltersChange({ category_id: v === 'all' ? '' : v })}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les catégories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.is_available || 'all'}
                    onValueChange={(v) => onFiltersChange({ is_available: v === 'all' ? '' : v })}
                >
                    <SelectTrigger className="w-[170px]">
                        <SelectValue placeholder="Disponibilité" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="1">Disponibles</SelectItem>
                        <SelectItem value="0">Indisponibles</SelectItem>
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