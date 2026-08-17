// app/shop/suppliers/page.jsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Truck, Plus, Upload, CheckCircle2, EyeOff, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SupplierStatsCards from '@/components/suppliers/SupplierStatsCards';
import SupplierFilters from '@/components/suppliers/SupplierFilters';
import SuppliersTable from '@/components/suppliers/SuppliersTable';
import SupplierFormModal from '@/components/suppliers/SupplierFormModal';
import DataImportModal from '@/components/common/DataImportModal';
import DataExportButton from '@/components/common/DataExportButton';
import BulkActionBar from '@/components/common/BulkActionBar';
import BulkConfirmModal from '@/components/common/BulkConfirmModal';
import BulkResultModal from '@/components/common/BulkResultModal';
import ColumnSelector from '@/components/common/ColumnSelector';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { SUPPLIERS_COLUMNS } from '@/config/tableColumns';
import useSupplierStore from '@/store/supplierStore';
import useCompanyStore from '@/store/companyStore';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';

export default function SuppliersPage() {
    const { suppliers, pagination, stats, isLoading, filters, setFilters, setPage, fetchSuppliers, executeBulkAction } = useSupplierStore();
    const { activeCompany } = useCompanyStore();
    const searchParams = useSearchParams();
    const [formOpen, setFormOpen] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);

    // Préférences de colonnes
    const { visibleColumns, toggleColumn, resetToDefaults, hiddenCount } =
        useColumnPreferences('suppliers', SUPPLIERS_COLUMNS, activeCompany?.id);

    // Modals pour les Bulk Actions
    const [bulkConfirm, setBulkConfirm] = useState({
        open: false,
        action: null,
        title: '',
        description: '',
        isDestructive: false,
        actionType: 'default',
        warningMessage: null,
    });
    const [isBulkExecuting, setIsBulkExecuting] = useState(false);
    const [bulkResult, setBulkResult] = useState({ open: false, result: null });

    // Synchroniser la recherche si l'URL change
    useEffect(() => {
        const urlQuery = searchParams?.get('search');
        if (urlQuery !== null && urlQuery !== undefined) {
            setFilters({ search: urlQuery });
        } else {
            fetchSuppliers();
        }
    }, [searchParams, fetchSuppliers, setFilters]);

    // Hook de sélection en masse
    const bulkSelection = useBulkSelection(suppliers);

    // Exécution de l'action en masse
    const handleExecuteBulkAction = async ({ value, inputValue, reason } = {}) => {
        if (!activeCompany || bulkSelection.selectedCount === 0) return;

        setIsBulkExecuting(true);
        const action = bulkConfirm.action;
        const params = {};

        if (action === 'change_city') {
            params.city = inputValue || value || reason;
        } else if (action === 'delete') {
            params.reason = reason;
        }

        const response = await executeBulkAction(activeCompany.id, {
            ids: bulkSelection.selectedIdsArray,
            action,
            params,
        });

        setIsBulkExecuting(false);
        setBulkConfirm((prev) => ({ ...prev, open: false }));

        if (response.success) {
            bulkSelection.clearSelection();
            fetchSuppliers();
            if (response.data?.skipped_count > 0 || response.data?.failed_count > 0) {
                setBulkResult({ open: true, result: response.data });
            } else {
                toast.success(response.message || `${bulkSelection.selectedCount} fournisseur(s) traité(s).`);
            }
        } else {
            toast.error(response.message);
        }
    };

    const bulkPrimaryActions = [
        {
            label: 'Activer',
            icon: CheckCircle2,
            onClick: () => {
                setBulkConfirm({
                    open: true,
                    action: 'activate',
                    actionType: 'activate',
                    title: 'Activer les fournisseurs sélectionnés',
                    description: 'Ces fournisseurs redeviendront actifs pour la création de commandes et paiements.',
                    isDestructive: false,
                });
            },
        },
        {
            label: 'Désactiver',
            icon: EyeOff,
            onClick: () => {
                setBulkConfirm({
                    open: true,
                    action: 'deactivate',
                    actionType: 'deactivate',
                    title: 'Désactiver les fournisseurs sélectionnés',
                    description: 'Ces fournisseurs seront archivés mais conserveront tout leur historique de commandes et règlements.',
                    isDestructive: false,
                });
            },
        },
        {
            label: 'Changer la ville',
            icon: MapPin,
            onClick: () => {
                setBulkConfirm({
                    open: true,
                    action: 'change_city',
                    actionType: 'change_city',
                    title: 'Définir la ville pour les fournisseurs sélectionnés',
                    description: 'Renseignez le nom de la ville à affecter aux fournisseurs sélectionnés.',
                    isDestructive: false,
                    confirmLabel: 'Enregistrer la ville',
                    showInput: true,
                    inputLabel: 'Nom de la nouvelle ville',
                    inputPlaceholder: 'Ex: Abidjan, Douala, Dakar, Paris, Lomé...',
                    inputRequired: true,
                });
            },
        },
    ];

    const bulkSecondaryActions = [
        {
            label: 'Supprimer les fournisseurs éligibles',
            icon: Trash2,
            danger: true,
            onClick: () => {
                setBulkConfirm({
                    open: true,
                    action: 'delete',
                    actionType: 'delete',
                    title: 'Supprimer les fournisseurs sélectionnés',
                    description: 'Les fournisseurs sans commandes en cours ni solde impayé seront supprimés.',
                    isDestructive: true,
                    confirmLabel: 'Supprimer',
                    warningMessage: 'Règle de sécurité : Tout fournisseur ayant des commandes non clôturées ou un solde dû sera automatiquement ignoré et conservé.',
                });
            },
        },
    ];

    return (
        <PermissionGuard requiredPermission="suppliers.view">
            <div className="p-6 space-y-6">
                {/* Titre + bouton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-[#F9FAFB]">
                            <Truck size={24} className="text-brand-600 dark:text-brand-400" />
                            Fournisseurs
                        </h1>
                        <p className="text-gray-500 dark:text-[#D1D5DB] text-sm mt-1">
                            Gérez vos fournisseurs et suivez vos dettes ({pagination?.total_count || suppliers.length})
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <ColumnSelector
                            columnsDef={SUPPLIERS_COLUMNS}
                            visibleColumns={visibleColumns}
                            onToggle={toggleColumn}
                            onReset={resetToDefaults}
                            hiddenCount={hiddenCount}
                        />
                        <DataExportButton moduleName="suppliers" />
                        <HasPermission required="suppliers.create">
                            <Button
                                variant="outline"
                                onClick={() => setImportModalOpen(true)}
                                className="border-brand-200 dark:border-[#374151] text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-[#1F2937] h-9 font-medium"
                            >
                                <Upload size={16} className="mr-2" /> Importer
                            </Button>
                            <Button
                                onClick={() => setFormOpen(true)}
                                className="bg-brand-600 hover:bg-brand-700 text-white h-9"
                            >
                                <Plus size={16} className="mr-2" /> Nouveau fournisseur
                            </Button>
                        </HasPermission>
                    </div>
                </div>

                {/* Stats */}
                <SupplierStatsCards stats={stats} />

                {/* Filtres */}
                <SupplierFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                />

                {/* Tableau */}
                <SuppliersTable
                    suppliers={suppliers}
                    pagination={pagination}
                    setPage={setPage}
                    isLoading={isLoading}
                    selectedIds={bulkSelection.selectedIds}
                    onToggleSelect={bulkSelection.toggleSelect}
                    onToggleSelectAll={bulkSelection.toggleSelectPage}
                    isAllPageSelected={bulkSelection.isAllPageSelected}
                    isSomePageSelected={bulkSelection.isSomePageSelected}
                    isSelected={bulkSelection.isSelected}
                    visibleColumns={visibleColumns}
                />

                {/* Barre d'actions en masse flottante */}
                <BulkActionBar
                    selectedCount={bulkSelection.selectedCount}
                    totalCount={pagination?.total_count || suppliers.length}
                    isAllPageSelected={bulkSelection.isAllPageSelected}
                    onClearSelection={bulkSelection.clearSelection}
                    primaryActions={bulkPrimaryActions}
                    secondaryActions={bulkSecondaryActions}
                    itemName="fournisseur"
                    itemPlural="fournisseurs"
                />

                {/* Modale de confirmation Bulk */}
                <BulkConfirmModal
                    isOpen={bulkConfirm.open}
                    onClose={() => setBulkConfirm((prev) => ({ ...prev, open: false }))}
                    onConfirm={handleExecuteBulkAction}
                    title={bulkConfirm.title}
                    description={bulkConfirm.description}
                    count={bulkSelection.selectedCount}
                    actionType={bulkConfirm.actionType}
                    isDestructive={bulkConfirm.isDestructive}
                    confirmLabel={bulkConfirm.confirmLabel || 'Confirmer'}
                    warningMessage={bulkConfirm.warningMessage}
                    showInput={bulkConfirm.showInput}
                    inputLabel={bulkConfirm.inputLabel}
                    inputPlaceholder={bulkConfirm.inputPlaceholder}
                    inputRequired={bulkConfirm.inputRequired}
                    isLoading={isBulkExecuting}
                />

                {/* Modale de rapport post-exécution */}
                <BulkResultModal
                    isOpen={bulkResult.open}
                    onClose={() => setBulkResult({ open: false, result: null })}
                    result={bulkResult.result}
                    title="Résultat de l'action sur les fournisseurs"
                />

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