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

export default function SuppliersTable() {
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
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                <Truck size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-400">Aucun fournisseur trouvé</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fournisseur</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Ville</TableHead>
                            <TableHead className="text-right">Total achats</TableHead>
                            <TableHead className="text-right">Solde dû</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {suppliers.map((supplier) => (
                            <TableRow key={supplier.id} className={!supplier.is_active ? 'opacity-60 bg-gray-50' : ''}>
                                <TableCell>
                                    <p className="font-medium text-sm">{supplier.company_name}</p>
                                    {supplier.email && <p className="text-xs text-gray-400">{supplier.email}</p>}
                                </TableCell>
                                <TableCell className="text-sm">{supplier.contact_name || '-'}</TableCell>
                                <TableCell className="text-sm">{supplier.phone}</TableCell>
                                <TableCell className="text-sm">{supplier.city || '-'}</TableCell>
                                <TableCell className="text-right text-sm font-medium">
                                    {Number(supplier.total_purchases || 0).toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className={`text-sm font-medium ${parseFloat(supplier.current_balance) > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                        {Number(supplier.current_balance || 0).toLocaleString()} FCFA
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    {supplier.is_active ? (
                                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Actif</span>
                                    ) : (
                                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inactif</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openDetail(supplier.id)} title="Voir détails">
                                            <Eye size={16} />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(supplier)} title="Modifier">
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openToggleConfirm(supplier)}
                                            title={supplier.is_active ? 'Désactiver' : 'Activer'}
                                            className={supplier.is_active ? 'text-amber-600' : 'text-green-600'}
                                        >
                                            {supplier.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openDeleteConfirm(supplier)} title="Supprimer" className="text-red-600">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
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