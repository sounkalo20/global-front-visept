// components/supplier-orders/OrderFilters.jsx
'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { suppliersApi } from '@/lib/api/suppliers';
import useCompanyStore from '@/store/companyStore';

export default function OrderFilters({ filters, onFiltersChange }) {
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [suppliers, setSuppliers] = useState([]);
    const activeCompany = useCompanyStore((s) => s.activeCompany);

    useEffect(() => {
        if (activeCompany?.id) {
            suppliersApi.getAll(activeCompany.id, { limit: 200 }).then(res => {
                setSuppliers(res.data.data.suppliers || []);
            }).catch(() => { });
        }
    }, [activeCompany]);

    const handleSearch = () => onFiltersChange({ search: searchValue });
    const handleClear = () => { setSearchValue(''); onFiltersChange({ search: '', supplier_id: '', status: '' }); };
    const hasFilters = filters.search || filters.supplier_id || filters.status;

    return (
        <div className="bg-white rounded-xl border p-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] flex gap-2">
                    <Input placeholder="N° commande ou référence..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    <Button variant="outline" size="icon" onClick={handleSearch}><Search size={16} /></Button>
                </div>

                <Select value={filters.supplier_id || 'all'} onValueChange={(v) => onFiltersChange({ supplier_id: v === 'all' ? '' : v })}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Fournisseur" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les fournisseurs</SelectItem>
                        {suppliers.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.company_name}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={filters.status || 'all'} onValueChange={(v) => onFiltersChange({ status: v === 'all' ? '' : v })}>
                    <SelectTrigger className="w-[170px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="ordered">Commandée</SelectItem>
                        <SelectItem value="confirmed">Confirmée</SelectItem>
                        <SelectItem value="partially_received">Partiellement reçue</SelectItem>
                        <SelectItem value="received">Reçue</SelectItem>
                        <SelectItem value="canceled">Annulée</SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && <Button variant="ghost" onClick={handleClear} className="text-red-500"><X size={16} className="mr-1" />Effacer</Button>}
            </div>
        </div>
    );
}