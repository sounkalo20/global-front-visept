// components/restaurant/PaymentsTable.jsx
'use client';
import { useState } from 'react';
import { Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import ConfirmModal from '@/components/super-admin/ConfirmModal';
import useRestaurantPaymentStore from '@/store/restaurantPaymentStore';
import { toast } from 'sonner';

export default function PaymentsTable() {
    const { payments, pagination, isLoading, setPage, deletePayment } = useRestaurantPaymentStore();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const handleDelete = async () => {
        setConfirmLoading(true);
        const result = await deletePayment(selectedPayment.id);
        setConfirmLoading(false);
        if (result.success) toast.success('Paiement supprimé.');
        else toast.error(result.message);
        setConfirmOpen(false);
    };

    if (isLoading) {
        return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>;
    }

    if (payments.length === 0) {
        return <div className="text-center py-12 text-gray-500"><Receipt size={48} className="mx-auto text-gray-300 mb-3" /><p className="font-medium text-gray-400">Aucun paiement trouvé</p></div>;
    }

    return (
        <>
            <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>N° Commande</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead>Méthode</TableHead>
                            <TableHead>Référence</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="text-sm">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell className="text-sm font-medium">{p.client_name}</TableCell>
                                <TableCell className="text-sm">{p.sale_number || '-'}</TableCell>
                                <TableCell className="text-right text-sm font-bold text-green-600">{Number(p.amount).toLocaleString()} FCFA</TableCell>
                                <TableCell className="text-sm capitalize">{p.payment_method?.replace('_', ' ')}</TableCell>
                                <TableCell className="text-sm text-gray-500">{p.payment_reference || '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedPayment(p); setConfirmOpen(true); }} className="text-red-600"><Trash2 size={16} /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="mt-4"><Pagination><PaginationContent>
                    <PaginationItem><PaginationPrevious onClick={() => setPage(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} /></PaginationItem>
                    <PaginationItem><span className="text-sm text-gray-500 px-4">Page {pagination.page} sur {pagination.pages}</span></PaginationItem>
                    <PaginationItem><PaginationNext onClick={() => setPage(Math.min(pagination.pages, pagination.page + 1))} disabled={pagination.page === pagination.pages} /></PaginationItem>
                </PaginationContent></Pagination></div>
            )}

            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete}
                title="Supprimer ce paiement" description={`Supprimer le paiement de ${Number(selectedPayment?.amount).toLocaleString()} FCFA ?`}
                confirmLabel="Supprimer" confirmVariant="destructive" isLoading={confirmLoading} />
        </>
    );
}