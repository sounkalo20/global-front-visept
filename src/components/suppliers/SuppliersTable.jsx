// components/suppliers/SuppliersTable.jsx
'use client';
import { useState } from 'react';
import { Eye, Pencil, Trash2, Power, PowerOff, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination';
import ConfirmModal from '@/components/super-admin/ConfirmModal';
import SupplierFormModal from './SupplierFormModal';
import useSupplierStore from '@/store/supplierStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import HasPermission from '@/components/auth/HasPermission';

export default function SuppliersTable({
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    isAllPageSelected,
    isSomePageSelected,
    isSelected,
} = {}) {
    const { suppliers, pagination, isLoading, setPage, deleteSupplier, toggleStatus } =
        useSupplierStore();
    const router = useRouter();

    const [formOpen, setFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const openDetail = (id) => {
        router.push(`/shop/suppliers/${id}`);
    };

    const openEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormOpen(true);
    };

    const openDeleteConfirm = (supplier) => {
        setConfirmAction('delete');
        setConfirmTarget(supplier);
        setConfirmOpen(true);
    };

    const openToggleConfirm = (supplier) => {
        setConfirmAction(supplier.is_active ? 'deactivate' : 'activate');
        setConfirmTarget(supplier);
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        setConfirmLoading(true);
        let result;

        if (confirmAction === 'delete') {
            result = await deleteSupplier(confirmTarget.id);
        } else {
            result = await toggleStatus(confirmTarget.id);
        }

        setConfirmLoading(false);

        if (result.success) {
            toast.success(result.message || 'Opération réussie.');
        } else {
            toast.error(result.message);
        }

        setConfirmOpen(false);
        setConfirmAction(null);
        setConfirmTarget(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    if (suppliers.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 dark:text-[#D1D5DB] bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-[#374151] shadow-xs">
                <Truck size={48} className="mx-auto text-gray-300 dark:text-[#4B5563] mb-3" />
                <p className="font-semibold text-gray-500 dark:text-[#D1D5DB]">Aucun fournisseur trouvé</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-[#374151] overflow-hidden shadow-xs">
                <Table>
                    <TableHeader className="bg-gray-50/80 dark:bg-[#1F2937]/80">
                        <TableRow className="border-b border-gray-200 dark:border-[#374151]">
                            {onToggleSelect && (
                                <TableHead className="w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllPageSelected || false}
                                        ref={(input) => {
                                            if (input) input.indeterminate = isSomePageSelected || false;
                                        }}
                                        onChange={onToggleSelectAll}
                                        aria-label="Sélectionner tous les fournisseurs"
                                        className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                    />
                                </TableHead>
                            )}
                            <TableHead className="text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Fournisseur</TableHead>
                            <TableHead className="text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Contact</TableHead>
                            <TableHead className="text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Téléphone</TableHead>
                            <TableHead className="text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Ville</TableHead>
                            <TableHead className="text-right text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Total achats</TableHead>
                            <TableHead className="text-right text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Solde dû</TableHead>
                            <TableHead className="text-center text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Statut</TableHead>
                            <TableHead className="text-right text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
                        {suppliers.map((supplier) => {
                            const selected = isSelected?.(supplier.id) || false;
                            return (
                                <TableRow
                                    key={supplier.id}
                                    className={
                                        selected
                                            ? 'bg-brand-50/70 dark:bg-brand-950/40'
                                            : !supplier.is_active
                                            ? 'opacity-60 bg-gray-50 dark:bg-[#1F2937]/30'
                                            : 'hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/50'
                                    }
                                >
                                    {onToggleSelect && (
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => onToggleSelect(supplier.id)}
                                                aria-label={`Sélectionner ${supplier.company_name}`}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">{supplier.company_name}</p>
                                        {supplier.email && <p className="text-xs text-gray-400 dark:text-[#9CA3AF]">{supplier.email}</p>}
                                    </TableCell>
                                <TableCell className="text-sm text-gray-700 dark:text-slate-300">{supplier.contact_name || '-'}</TableCell>
                                <TableCell className="text-sm text-gray-700 dark:text-slate-300">{supplier.phone}</TableCell>
                                <TableCell className="text-sm text-gray-700 dark:text-slate-300">{supplier.city || '-'}</TableCell>
                                <TableCell className="text-right text-sm font-semibold text-gray-900 dark:text-slate-100">
                                    {Number(supplier.total_purchases || 0).toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className={`text-sm font-semibold ${parseFloat(supplier.current_balance) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-slate-400'}`}>
                                        {Number(supplier.current_balance || 0).toLocaleString()} FCFA
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    {supplier.is_active ? (
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400">Actif</span>
                                    ) : (
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">Inactif</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openDetail(supplier.id)} title="Voir détails" className="hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300">
                                            <Eye size={16} />
                                        </Button>
                                        <HasPermission required="suppliers.edit">
                                          <Button variant="ghost" size="icon" onClick={() => openEdit(supplier)} title="Modifier" className="hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300">
                                              <Pencil size={16} />
                                          </Button>
                                          <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => openToggleConfirm(supplier)}
                                              title={supplier.is_active ? 'Désactiver' : 'Activer'}
                                              className={supplier.is_active ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30' : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30'}
                                          >
                                              {supplier.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                                          </Button>
                                        </HasPermission>
                                        <HasPermission required="suppliers.delete">
                                          <Button variant="ghost" size="icon" onClick={() => openDeleteConfirm(supplier)} title="Supprimer" className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                                              <Trash2 size={16} />
                                          </Button>
                                        </HasPermission>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>

            {pagination && pagination.total_pages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious onClick={() => setPage(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="text-sm text-gray-500 px-4">Page {pagination.page} sur {pagination.total_pages}</span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext onClick={() => setPage(Math.min(pagination.total_pages, pagination.page + 1))} disabled={pagination.page === pagination.total_pages} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <SupplierFormModal
                isOpen={formOpen}
                onClose={() => { setFormOpen(false); setEditingSupplier(null); }}
                supplier={editingSupplier}
            />

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setConfirmAction(null); setConfirmTarget(null); }}
                onConfirm={handleConfirm}
                title={
                    confirmAction === 'delete' ? 'Supprimer ce fournisseur'
                        : confirmAction === 'deactivate' ? 'Désactiver ce fournisseur'
                            : 'Activer ce fournisseur'
                }
                description={
                    confirmAction === 'delete' ? `Êtes-vous sûr de vouloir supprimer "${confirmTarget?.company_name}" ?`
                        : confirmAction === 'deactivate' ? `Désactiver "${confirmTarget?.company_name}" ?`
                            : `Réactiver "${confirmTarget?.company_name}" ?`
                }
                confirmLabel={confirmAction === 'delete' ? 'Supprimer' : confirmAction === 'deactivate' ? 'Désactiver' : 'Activer'}
                confirmVariant={confirmAction === 'delete' || confirmAction === 'deactivate' ? 'destructive' : 'default'}
                isLoading={confirmLoading}
            />
        </>
    );
}