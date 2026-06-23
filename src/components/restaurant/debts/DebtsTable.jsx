// components/restaurant/DebtsTable.jsx
'use client';
import { useState } from 'react';
import { Eye, Ban, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import DebtDetailModal from './DebtDetailModal';
import PaymentFormModal from './PaymentFormModal';
import ConfirmModal from '@/components/super-admin/ConfirmModal';
import useRestaurantDebtStore from '@/store/restaurantDebtStore';
import { toast } from 'sonner';

const statusConfig = {
    pending: { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
    partial: { label: 'Partiel', className: 'bg-blue-100 text-blue-700' },
    paid: { label: 'Payé', className: 'bg-green-100 text-green-700' },
    overdue: { label: 'En retard', className: 'bg-red-100 text-red-700' },
    canceled: { label: 'Annulé', className: 'bg-gray-100 text-gray-600' },
};

export default function DebtsTable() {
    const { debts, pagination, isLoading, setPage, cancelDebt } = useRestaurantDebtStore();
    const [selectedId, setSelectedId] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentDebt, setPaymentDebt] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const openDetail = (id) => { setSelectedId(id); setDetailOpen(true); };
    const openPayment = (debt) => { setPaymentDebt(debt); setPaymentOpen(true); };
    const openCancel = (debt) => { setConfirmTarget(debt); setConfirmOpen(true); };

    const handleCancel = async () => {
        setConfirmLoading(true);
        const result = await cancelDebt(confirmTarget.id);
        setConfirmLoading(false);
        if (result.success) toast.success('Dette annulée.');
        else toast.error(result.message);
        setConfirmOpen(false);
    };

    if (isLoading) {
        return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>;
    }

    if (debts.length === 0) {
        return <div className="text-center py-12 text-gray-500 bg-white rounded-xl border"><CreditCard size={48} className="mx-auto text-gray-300 mb-3" /><p className="font-medium text-gray-400">Aucune dette trouvée</p></div>;
    }

    return (
        <>
            <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>N° Commande</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Payé</TableHead>
                            <TableHead className="text-right">Restant</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead>Échéance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {debts.map((debt) => (
                            <TableRow key={debt.id} className={debt.status === 'canceled' ? 'opacity-50' : ''}>
                                <TableCell>
                                    <p className="font-medium text-sm">{debt.client_name}</p>
                                    <p className="text-xs text-gray-400">{debt.client_phone}</p>
                                </TableCell>
                                <TableCell className="text-sm">{debt.sale_number || '-'}</TableCell>
                                <TableCell className="text-right text-sm font-medium">{Number(debt.total_amount).toLocaleString()} FCFA</TableCell>
                                <TableCell className="text-right text-sm text-green-600">{Number(debt.total_paid).toLocaleString()} FCFA</TableCell>
                                <TableCell className="text-right text-sm font-bold text-red-600">{Number(debt.remaining_amount).toLocaleString()} FCFA</TableCell>
                                <TableCell className="text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[debt.status]?.className || ''}`}>
                                        {statusConfig[debt.status]?.label || debt.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                    {debt.due_date ? new Date(debt.due_date).toLocaleDateString('fr-FR') : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openDetail(debt.id)}><Eye size={16} /></Button>
                                        {!['paid', 'canceled'].includes(debt.status) && (
                                            <>
                                                <Button variant="ghost" size="icon" onClick={() => openPayment(debt)} className="text-green-600"><CreditCard size={16} /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => openCancel(debt)} className="text-red-600"><Ban size={16} /></Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="mt-4">
                    <Pagination><PaginationContent>
                        <PaginationItem><PaginationPrevious onClick={() => setPage(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} /></PaginationItem>
                        <PaginationItem><span className="text-sm text-gray-500 px-4">Page {pagination.page} sur {pagination.pages}</span></PaginationItem>
                        <PaginationItem><PaginationNext onClick={() => setPage(Math.min(pagination.pages, pagination.page + 1))} disabled={pagination.page === pagination.pages} /></PaginationItem>
                    </PaginationContent></Pagination>
                </div>
            )}

            <DebtDetailModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} debtId={selectedId} />
            <PaymentFormModal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} debt={paymentDebt} />

            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleCancel}
                title="Annuler cette dette" description={`Annuler la dette de "${confirmTarget?.client_name}" ?`}
                confirmLabel="Annuler la dette" confirmVariant="destructive" isLoading={confirmLoading} />
        </>
    );
}