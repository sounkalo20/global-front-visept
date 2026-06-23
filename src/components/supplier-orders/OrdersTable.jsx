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

export default function OrdersTable() {
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
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-400">Aucune commande trouvée</p>
        </div>
    );

    return (
        <>
            <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Commande</TableHead>
                            <TableHead>Fournisseur</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Payé</TableHead>
                            <TableHead className="text-right">Reste</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center">Articles</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} className={order.status === 'canceled' ? 'opacity-60' : ''}>
                                <TableCell>
                                    <p className="font-medium text-sm">{order.order_number}</p>
                                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                                </TableCell>
                                <TableCell className="text-sm">{order.supplier_name}</TableCell>
                                <TableCell className="text-right text-sm font-medium">{Number(order.total_amount).toLocaleString()} FCFA</TableCell>
                                <TableCell className="text-right text-sm text-green-600">{Number(order.total_paid).toLocaleString()} FCFA</TableCell>
                                <TableCell className="text-right text-sm text-red-600">{Number(order.remaining_balance).toLocaleString()} FCFA</TableCell>
                                <TableCell className="text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status]?.className}`}>
                                        {statusConfig[order.status]?.label}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center text-sm">{order.items_count || 0}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openDetail(order.id)}><Eye size={16} /></Button>
                                        {['draft', 'ordered', 'confirmed'].includes(order.status) && (
                                            <>
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(order)}><Pencil size={16} /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => openCancel(order)} className="text-red-600"><Ban size={16} /></Button>
                                            </>
                                        )}
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