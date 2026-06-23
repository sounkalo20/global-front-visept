// components/super-admin/PaymentsTable.jsx
'use client';
import { useState } from 'react';
import { Eye, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import PaymentDetailModal from './PaymentDetailModal';
import ConfirmModal from './ConfirmModal';
import useSuperAdminPaymentStore from '@/store/superAdmin/superAdminPaymentStore';
import { toast } from 'sonner';

export default function PaymentsTable() {
    const { payments, pagination, isLoading, setPage, approvePayment, rejectPayment } =
        useSuperAdminPaymentStore();

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const openDetail = (payment) => {
        setSelectedPayment(payment);
        setDetailOpen(true);
    };

    const openApproveConfirm = (payment) => {
        setConfirmAction('approve');
        setSelectedPayment(payment);
        setConfirmOpen(true);
    };

    const openRejectConfirm = (payment) => {
        setConfirmAction('reject');
        setSelectedPayment(payment);
        setConfirmOpen(true);
    };

    const handleConfirm = async (reason) => {
        setConfirmLoading(true);
        let result;

        if (confirmAction === 'approve') {
            result = await approvePayment(selectedPayment.id);
        } else {
            result = await rejectPayment(selectedPayment.id, reason);
        }

        setConfirmLoading(false);

        if (result.success) {
            toast.success(
                confirmAction === 'approve'
                    ? 'Paiement approuvé avec succès.'
                    : 'Paiement rejeté.'
            );
        } else {
            toast.error(result.message);
        }

        setConfirmOpen(false);
        setConfirmAction(null);
        setSelectedPayment(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                Aucun paiement en attente.
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Entreprise</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Méthode</TableHead>
                            <TableHead>Référence</TableHead>
                            <TableHead>Soumis le</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>
                                    <p className="font-medium text-sm">{payment.company_name}</p>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                        {payment.plan_name}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {Number(payment.amount).toLocaleString()} FCFA
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm capitalize">
                                        {payment.payment_method?.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-500">
                                        {payment.payment_reference || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                    {new Date(payment.submitted_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDetail(payment)}
                                            title="Voir détails"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openApproveConfirm(payment)}
                                            title="Approuver"
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <Check size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openRejectConfirm(payment)}
                                            title="Rejeter"
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(Math.max(1, pagination.page - 1))}
                                    disabled={pagination.page === 1}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <span className="text-sm text-gray-500 px-4">
                                    Page {pagination.page} sur {pagination.total_pages}
                                </span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(Math.min(pagination.total_pages, pagination.page + 1))}
                                    disabled={pagination.page === pagination.total_pages}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Modal détail */}
            <PaymentDetailModal
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                payment={selectedPayment}
                onApprove={openApproveConfirm}
                onReject={openRejectConfirm}
            />

            {/* Modal confirmation */}
            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setConfirmAction(null);
                    setSelectedPayment(null);
                }}
                onConfirm={handleConfirm}
                title={
                    confirmAction === 'approve'
                        ? 'Approuver ce paiement'
                        : 'Rejeter ce paiement'
                }
                description={
                    confirmAction === 'approve'
                        ? `Êtes-vous sûr de vouloir approuver ce paiement de ${Number(selectedPayment?.amount).toLocaleString()} FCFA pour "${selectedPayment?.company_name}" ?`
                        : `Êtes-vous sûr de vouloir rejeter ce paiement ? Cette action est irréversible.`
                }
                confirmLabel={confirmAction === 'approve' ? 'Approuver' : 'Rejeter'}
                confirmVariant={confirmAction === 'approve' ? 'default' : 'destructive'}
                showReasonInput={confirmAction === 'reject'}
                reasonPlaceholder="Motif du rejet..."
                isLoading={confirmLoading}
            />
        </>
    );
}