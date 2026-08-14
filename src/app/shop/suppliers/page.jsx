// app/shop/suppliers/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { Truck, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SupplierStatsCards from '@/components/suppliers/SupplierStatsCards';
import SupplierFilters from '@/components/suppliers/SupplierFilters';
import SuppliersTable from '@/components/suppliers/SuppliersTable';
import SupplierFormModal from '@/components/suppliers/SupplierFormModal';
import DataImportModal from '@/components/common/DataImportModal';
import DataExportButton from '@/components/common/DataExportButton';
import useSupplierStore from '@/store/supplierStore';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';

export default function SuppliersPage() {
    const { stats, filters, setFilters, fetchSuppliers } = useSupplierStore();
    const [formOpen, setFormOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return (
        <PermissionGuard requiredPermission="suppliers.view">
            <div className="p-6 space-y-6">
                {/* Titre + bouton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Truck size={24} className="text-brand-600" />
                        Fournisseurs
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Gérez vos fournisseurs et suivez vos dettes
                    </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <DataExportButton moduleName="suppliers" />
                    <HasPermission required="suppliers.create">
                        <Button
                            variant="outline"
                            onClick={() => setImportModalOpen(true)}
                            className="border-brand-200 text-brand-700 hover:bg-brand-50 h-9 font-medium"
                        >
                            <Upload size={16} className="mr-1.5 text-brand-600" />
                            Importer
                        </Button>
                        <Button onClick={() => setFormOpen(true)} className="h-9 font-medium">
                            <Plus size={16} className="mr-1.5" />
                            Nouveau fournisseur
                        </Button>
                    </HasPermission>
                </div>
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

            {/* Modal Importation */}
            <DataImportModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                moduleName="suppliers"
                onSuccess={fetchSuppliers}
            />
        </div>
        </PermissionGuard>
    );
}