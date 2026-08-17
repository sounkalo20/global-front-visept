// app/shop/supplier-orders/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Package, Plus, Send, CheckCircle2, Ban, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderStatsCards from '@/components/supplier-orders/OrderStatsCards';
import OrderFilters from '@/components/supplier-orders/OrderFilters';
import OrdersTable from '@/components/supplier-orders/OrdersTable';
import OrderFormModal from '@/components/supplier-orders/OrderFormModal';
import BulkActionBar from '@/components/common/BulkActionBar';
import BulkConfirmModal from '@/components/common/BulkConfirmModal';
import BulkResultModal from '@/components/common/BulkResultModal';
import ColumnSelector from '@/components/common/ColumnSelector';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { SUPPLIER_ORDERS_COLUMNS } from '@/config/tableColumns';
import useSupplierOrderStore from '@/store/supplierOrderStore';
import useCompanyStore from '@/store/companyStore';
import { toast } from 'sonner';

export default function SupplierOrdersPage() {
    const { orders, pagination, stats, filters, setFilters, fetchOrders, executeBulkAction } = useSupplierOrderStore();
    const { activeCompany } = useCompanyStore();
    const searchParams = useSearchParams();
    const [formOpen, setFormOpen] = useState(false);

    // Préférences de colonnes
    const { visibleColumns, toggleColumn, resetToDefaults, hiddenCount } =
        useColumnPreferences('supplier_orders', SUPPLIER_ORDERS_COLUMNS, activeCompany?.id);

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
            fetchOrders();
        }
    }, [searchParams, fetchOrders, setFilters]);

    // Hook de sélection en masse
    const bulkSelection = useBulkSelection(orders);

    // Exécution de l'action en masse
    const handleExecuteBulkAction = async ({ value, reason } = {}) => {
        if (!activeCompany || bulkSelection.selectedCount === 0) return;

        setIsBulkExecuting(true);
        const action = bulkConfirm.action;
        const params = { reason };

        const response = await executeBulkAction(activeCompany.id, {
            ids: bulkSelection.selectedIdsArray,
            action,
            params,
        });

        setIsBulkExecuting(false);
        setBulkConfirm((prev) => ({ ...prev, open: false }));

        if (response.success) {
            bulkSelection.clearSelection();
            fetchOrders();
            if (response.data?.skipped_count > 0 || response.data?.failed_count > 0) {
                setBulkResult({ open: true, result: response.data });
            } else {
                toast.success(response.message || `${bulkSelection.selectedCount} commande(s) traitée(s).`);
            }
        } else {
            toast.error(response.message);
        }
    };

    const bulkPrimaryActions = [
        {
            label: 'Passer en "Commandée"',
            icon: Send,
            onClick: () => {
                setBulkConfirm({
                    open: true,
                    action: 'mark_as_ordered',
                    actionType: 'default',
                    title: 'Passer les commandes sélectionnées en "Commandée"',
                    description: 'Valide l\'envoi officiel des bons de commande aux fournisseurs concernés.',
                    isDestructive: false,
                });
            },
        },
        {
            label: 'Confirmer',
            icon: CheckCircle2,
            onClick: () => {
                setBulkConfirm({
                    open: true,
                    action: 'mark_as_confirmed',
                    actionType: 'default',
                    title: 'Confirmer les commandes sélectionnées',
                    description: 'Enregistre la confirmation de commande reçue de vos fournisseurs.',
                    isDestructive: false,
                });
            },
        },
        {
            label: 'Annuler',
            icon: Ban,
            danger: true,
            onClick: () => {
                setBulkConfirm({
                    open: true,
                    action: 'cancel',
                    actionType: 'delete',
                    title: 'Annuler les commandes sélectionnées',
                    description: 'Seules les commandes non encore réceptionnées seront annulées.',
                    isDestructive: true,
                    confirmLabel: 'Annuler les commandes',
                    warningMessage: 'Règle de sécurité : Toute commande ayant déjà fait l\'objet d\'une réception totale ou partielle sera automatiquement protégée et ignorée.',
                });
            },
        },
    ];

    const bulkSecondaryActions = [
        {
            label: 'Supprimer les brouillons',
            icon: Trash2,
            danger: true,
            onClick: () => {
                setBulkConfirm({
                    open: true,
                    action: 'delete',
                    actionType: 'delete',
                    title: 'Supprimer les brouillons de commande',
                    description: 'Supprime définitivement les commandes sélectionnées qui sont au statut "Brouillon".',
                    isDestructive: true,
                    confirmLabel: 'Supprimer',
                    warningMessage: 'Règle de sécurité : Toute commande déjà passée, confirmée ou reçue sera ignorée.',
                });
            },
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-[#F9FAFB]">
                        <Package size={24} className="text-brand-600 dark:text-brand-400" />
                        Commandes fournisseurs
                    </h1>
                    <p className="text-gray-500 dark:text-[#D1D5DB] text-sm mt-1">
                        Gérez vos bons de commande et réceptions ({pagination?.total_count || orders.length})
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ColumnSelector
                        columnsDef={SUPPLIER_ORDERS_COLUMNS}
                        visibleColumns={visibleColumns}
                        onToggle={toggleColumn}
                        onReset={resetToDefaults}
                        hiddenCount={hiddenCount}
                    />
                    <Button onClick={() => setFormOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white">
                        <Plus size={16} className="mr-2" />
                        Nouvelle commande
                    </Button>
                </div>
            </div>
            <OrderStatsCards stats={stats} />
            <OrderFilters filters={filters} onFiltersChange={setFilters} />
            <OrdersTable
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
                totalCount={pagination?.total_count || orders.length}
                isAllPageSelected={bulkSelection.isAllPageSelected}
                onClearSelection={bulkSelection.clearSelection}
                primaryActions={bulkPrimaryActions}
                secondaryActions={bulkSecondaryActions}
                itemName="commande"
                itemPlural="commandes"
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
                isLoading={isBulkExecuting}
            />

            {/* Modale de rapport post-exécution */}
            <BulkResultModal
                isOpen={bulkResult.open}
                onClose={() => setBulkResult({ open: false, result: null })}
                result={bulkResult.result}
                title="Résultat de l'action sur les commandes"
            />

            <OrderFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
        </div>
    );
}