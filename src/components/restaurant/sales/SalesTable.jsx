// components/restaurant/SalesTable.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Ban, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import ConfirmModal from '@/components/super-admin/ConfirmModal';
import useRestaurantSaleStore from '@/store/restaurantSaleStore';
import { toast } from 'sonner';

const paymentStatusConfig = {
    paid: { label: 'Payé', className: 'bg-green-100 text-green-700' },
    partial: { label: 'Partiel', className: 'bg-amber-100 text-amber-700' },
    unpaid: { label: 'Impayé', className: 'bg-red-100 text-red-700' },
    debt: { label: 'Dette', className: 'bg-orange-100 text-orange-700' },
};

export default function SalesTable() {
    const router = useRouter();
    const { sales, pagination, isLoading, setPage, cancelSale } = useRestaurantSaleStore();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const handleCancel = async (reason) => {
        setConfirmLoading(true);
        const result = await cancelSale(confirmTarget.id, reason);
        setConfirmLoading(false);
        if (result.success) toast.success('Commande annulée.');
        else toast.error(result.message);
        setConfirmOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    if (sales.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-400">Aucune vente trouvée</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Commande</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Payé</TableHead>
                            <TableHead className="text-center">Paiement</TableHead>
                            <TableHead className="text-center">Articles</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell>
                                    <p className="font-medium text-sm">{sale.sale_number}</p>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">
                                        {sale.client_first_name
                                            ? `${sale.client_first_name} ${sale.client_last_name || ''}`
                                            : sale.client_name || 'Client passage'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-medium text-sm">
                                    {Number(sale.total_amount).toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="text-right text-sm">
                                    {Number(sale.amount_paid).toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusConfig[sale.payment_status]?.className || 'bg-gray-100'}`}>
                                        {paymentStatusConfig[sale.payment_status]?.label || sale.payment_status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center text-sm">{sale.items_count || 0}</TableCell>
                                <TableCell className="text-sm text-gray-500">
                                    {new Date(sale.sale_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => router.push(`/restaurant/sales/${sale.id}`)}>
                                            <Eye size={16} />
                                        </Button>
                                        {sale.status !== 'canceled' && (
                                            <Button variant="ghost" size="icon" onClick={() => { setConfirmTarget(sale); setConfirmOpen(true); }} className="text-red-600">
                                                <Ban size={16} />
                                            </Button>
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
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem><PaginationPrevious onClick={() => setPage(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} /></PaginationItem>
                            <PaginationItem><span className="text-sm text-gray-500 px-4">Page {pagination.page} sur {pagination.pages}</span></PaginationItem>
                            <PaginationItem><PaginationNext onClick={() => setPage(Math.min(pagination.pages, pagination.page + 1))} disabled={pagination.page === pagination.pages} /></PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleCancel}
                title="Annuler cette commande"
                description={`Annuler la commande "${confirmTarget?.sale_number}" ?`}
                confirmLabel="Annuler la commande"
                confirmVariant="destructive"
                showReasonInput
                reasonPlaceholder="Motif de l'annulation..."
                isLoading={confirmLoading}
            />
        </>
    );
}