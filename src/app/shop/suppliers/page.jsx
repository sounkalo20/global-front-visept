// app/shop/suppliers/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { Truck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SupplierStatsCards from '@/components/suppliers/SupplierStatsCards';
import SupplierFilters from '@/components/suppliers/SupplierFilters';
import SuppliersTable from '@/components/suppliers/SuppliersTable';
import SupplierFormModal from '@/components/suppliers/SupplierFormModal';
import useSupplierStore from '@/store/supplierStore';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';

export default function SuppliersPage() {
    const { stats, filters, setFilters, fetchSuppliers } = useSupplierStore();
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return (
        <PermissionGuard requiredPermission="suppliers.view">
            <div className="p-6 space-y-6">
                {/* Titre + bouton */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck size={24} className="text-brand-600" />
                        Fournisseurs
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Gérez vos fournisseurs et suivez vos dettes
                    </p>
                </div>
                <HasPermission required="suppliers.create">
                    <Button onClick={() => setFormOpen(true)}>
                        <Plus size={16} className="mr-2" />
                        Nouveau fournisseur
                    </Button>
                </HasPermission>
            </div>

            {/* Stats */}
            <SupplierStatsCards stats={stats} />

            {/* Filtres */}
            <SupplierFilters filters={filters} onFiltersChange={setFilters} />

            {/* Table */}
            <SuppliersTable />

            {/* Modal formulaire */}
            <SupplierFormModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
            />
        </div>
        </PermissionGuard>
    );
}