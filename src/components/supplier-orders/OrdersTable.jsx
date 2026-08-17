// components/supplier-orders/OrdersTable.jsx
'use client';
import { useState } from 'react';
import { Eye, Pencil, Ban, CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import OrderDetailModal from './OrderDetailModal';
import OrderFormModal from './OrderFormModal';
import ConfirmModal from '@/components/super-admin/ConfirmModal';
import useSupplierOrderStore from '@/store/supplierOrderStore';
import { toast } from 'sonner';

const statusConfig = {
    draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
    ordered: { label: 'Commandée', className: 'bg-blue-100 text-blue-700' },
    confirmed: { label: 'Confirmée', className: 'bg-indigo-100 text-indigo-700' },
    partially_received: { label: 'Partiel', className: 'bg-amber-100 text-amber-700' },
    received: { label: 'Reçue', className: 'bg-green-100 text-green-700' },
    canceled: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
    disputed: { label: 'Litige', className: 'bg-orange-100 text-orange-700' },
};

export default function OrdersTable({
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    isAllPageSelected,
    isSomePageSelected,
    isSelected,
    visibleColumns,
} = {}) {
    const col = (id) => !visibleColumns || visibleColumns.has(id);
    const { orders, pagination, isLoading, setPage, cancelOrder, updateStatus } = useSupplierOrderStore();
    const [selectedId, setSelectedId] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const openDetail = (id) => { setSelectedId(id); setDetailOpen(true); };
    const openEdit = (order) => { setEditingOrder(order); setFormOpen(true); };
    const openCancel = (order) => { setConfirmAction('cancel'); setConfirmTarget(order); setConfirmOpen(true); };

    const handleConfirm = async (reason) => {
        setConfirmLoading(true);
        let result;
        if (confirmAction === 'cancel') result = await cancelOrder(confirmTarget.id, reason);
        setConfirmLoading(false);
        if (result.success) toast.success('Commande annulée.');
        else toast.error(result.message);
        setConfirmOpen(false);
    };

    if (isLoading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>;

    if (orders.length === 0) return (
        <div className="text-center py-12 text-gray-500 dark:text-[#D1D5DB] bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-[#374151]">
            <Package size={48} className="mx-auto text-gray-300 dark:text-[#4B5563] mb-3" />
            <p className="font-medium text-gray-400 dark:text-[#9CA3AF]">Aucune commande trouvée</p>
        </div>
    );

    return (
        <>
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-[#374151] overflow-hidden">
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
                                        aria-label="Sélectionner toutes les commandes"
                                        className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                    />
                                </TableHead>
                            )}
                            <TableHead className="text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">N° Commande</TableHead>
                            {col('supplier') && <TableHead className="text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Fournisseur</TableHead>}
                            <TableHead className="text-right text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Total</TableHead>
                            {col('paid') && <TableHead className="text-right text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Payé</TableHead>}
                            {col('remaining') && <TableHead className="text-right text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Reste</TableHead>}
                            {col('status') && <TableHead className="text-center text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Statut</TableHead>}
                            {col('items') && <TableHead className="text-center text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Articles</TableHead>}
                            <TableHead className="text-right text-gray-500 dark:text-[#D1D5DB] text-xs font-semibold uppercase">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
                        {orders.map((order) => {
                            const selected = isSelected?.(order.id) || false;
                            return (
                                <TableRow
                                    key={order.id}
                                    className={
                                        selected
                                            ? 'bg-brand-50/70 dark:bg-brand-950/40'
                                            : order.status === 'canceled'
                                            ? 'opacity-60 bg-gray-50 dark:bg-[#1F2937]/30'
                                            : 'hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/50'
                                    }
                                >
                                    {onToggleSelect && (
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => onToggleSelect(order.id)}
                                                aria-label={`Sélectionner ${order.order_number}`}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <p className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">{order.order_number}</p>
                                        {col('date') && <p className="text-xs text-gray-400 dark:text-[#9CA3AF]">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>}
                                    </TableCell>
                                    {col('supplier') && <TableCell className="text-sm text-gray-700 dark:text-[#D1D5DB]">{order.supplier_name}</TableCell>}
                                    <TableCell className="text-right text-sm font-semibold text-gray-900 dark:text-[#F9FAFB]">{Number(order.total_amount).toLocaleString()} FCFA</TableCell>
                                    {col('paid') && <TableCell className="text-right text-sm text-green-600 dark:text-green-400 font-medium">{Number(order.total_paid).toLocaleString()} FCFA</TableCell>}
                                    {col('remaining') && <TableCell className="text-right text-sm text-red-600 dark:text-red-400 font-medium">{Number(order.remaining_balance).toLocaleString()} FCFA</TableCell>}
                                    {col('status') && (
                                        <TableCell className="text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig[order.status]?.className}`}>
                                                {statusConfig[order.status]?.label}
                                            </span>
                                        </TableCell>
                                    )}
                                    {col('items') && <TableCell className="text-center text-sm text-gray-700 dark:text-[#D1D5DB]">{order.items_count || 0}</TableCell>}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => openDetail(order.id)} className="dark:text-[#D1D5DB] hover:bg-gray-100 dark:hover:bg-[#1F2937]"><Eye size={16} /></Button>
                                            {['draft', 'ordered', 'confirmed'].includes(order.status) && (
                                                <>
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(order)} className="dark:text-[#D1D5DB] hover:bg-gray-100 dark:hover:bg-[#1F2937]"><Pencil size={16} /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openCancel(order)} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"><Ban size={16} /></Button>
                                                </>
                                            )}
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
                            <PaginationItem><PaginationPrevious onClick={() => setPage(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} /></PaginationItem>
                            <PaginationItem><span className="text-sm text-gray-500 px-4">Page {pagination.page} sur {pagination.total_pages}</span></PaginationItem>
                            <PaginationItem><PaginationNext onClick={() => setPage(Math.min(pagination.total_pages, pagination.page + 1))} disabled={pagination.page === pagination.total_pages} /></PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <OrderDetailModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} orderId={selectedId} onEdit={openEdit} />
            <OrderFormModal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditingOrder(null); }} order={editingOrder} />
            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirm}
                title="Annuler cette commande"
                description={`Êtes-vous sûr de vouloir annuler la commande "${confirmTarget?.order_number}" ?`}
                confirmLabel="Annuler la commande" confirmVariant="destructive" showReasonInput reasonPlaceholder="Motif de l'annulation..."
                isLoading={confirmLoading} />
        </>
    );
}