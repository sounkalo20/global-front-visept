// components/super-admin/CompanyFilters.jsx
'use client';
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
import { useState } from 'react';

export default function CompanyFilters({ filters, onFiltersChange }) {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const handleSearch = () => {
        onFiltersChange({ search: searchValue });
    };

    const handleClearFilters = () => {
        setSearchValue('');
        onFiltersChange({
            search: '',
            status: '',
            business_type: '',
            plan: '',
        });
    };

    const hasActiveFilters = filters.search || filters.status || filters.business_type || filters.plan;

    return (
        <div className="bg-white rounded-xl border p-4 space-y-3">
            <div className="flex flex-wrap gap-3">
                {/* Recherche */}
                <div className="flex-1 min-w-[200px] flex gap-2">
                    <Input
                        placeholder="Rechercher une entreprise..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button variant="outline" size="icon" onClick={handleSearch}>
                        <Search size={16} />
                    </Button>
                </div>

                {/* Statut abonnement */}
                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => onFiltersChange({ status: value === 'all' ? '' : value })}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Statut abonnement" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="past_due">En retard</SelectItem>
                        <SelectItem value="canceled">Annulé</SelectItem>
                        <SelectItem value="expired">Expiré</SelectItem>
                    </SelectContent>
                </Select>

                {/* Type de business */}
                <Select
                    value={filters.business_type || 'all'}
                    onValueChange={(value) => onFiltersChange({ business_type: value === 'all' ? '' : value })}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Type de business" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="SHOP">Boutique</SelectItem>
                        <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                        <SelectItem value="SUPERMARKET">Supermarché</SelectItem>
                        <SelectItem value="SALON">Salon de coiffure</SelectItem>
                    </SelectContent>
                </Select>

                {/* Plan */}
                <Select
                    value={filters.plan || 'all'}
                    onValueChange={(value) => onFiltersChange({ plan: value === 'all' ? '' : value })}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les plans</SelectItem>
                        <SelectItem value="FREE">Gratuit</SelectItem>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                    </SelectContent>
                </Select>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <Button variant="ghost" onClick={handleClearFilters} className="text-red-500">
                        <X size={16} className="mr-1" /> Effacer
                    </Button>
                )}
            </div>
        </div>
    );
}