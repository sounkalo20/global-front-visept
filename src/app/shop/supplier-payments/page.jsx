// app/shop/supplier-payments/page.jsx (REMPLACER)
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, Plus, Search, X, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import GlobalPaymentModal from '@/components/supplier-payments/GlobalPaymentModal';
import PaymentFormModal from '@/components/supplier-payments/PaymentFormModal';
import ConfirmModal from '@/components/super-admin/ConfirmModal';
import { suppliersApi } from '@/lib/api/suppliers';
import { supplierOrdersApi } from '@/lib/api/supplierOrders';
import useCompanyStore from '@/store/companyStore';
import useSupplierPaymentStore from '@/store/supplierPaymentStore';
import { toast } from 'sonner';

export default function SupplierPaymentsPage() {
    const searchParams = useSearchParams();
    const orderIdFromUrl = searchParams.get('order');
    const router = useRouter();

    const {
        payments, stats, pagination, isLoading,
        filters, setFilters, setPage, fetchAllPayments,
        addPaymentToOrder, deletePayment,
    } = useSupplierPaymentStore();

    const activeCompany = useCompanyStore((s) => s.activeCompany);
    const [suppliers, setSuppliers] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [globalModalOpen, setGlobalModalOpen] = useState(false);
    const [orderPaymentModalOpen, setOrderPaymentModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        if (!activeCompany?.id) return;

        // Si une commande est spécifiée dans l'URL
        if (orderIdFromUrl) {
            setFilters({ order_id: orderIdFromUrl });
            // Charger les infos de la commande
            supplierOrdersApi.getById(orderIdFromUrl, activeCompany.id)
                .then(r => setCurrentOrder(r.data.data.order))
                .catch(() => { });
        } else {
            fetchAllPayments();
        }

        // Charger les fournisseurs pour les filtres
        suppliersApi.getAll(activeCompany.id, { limit: 200 })
            .then(r => setSuppliers(r.data.data.suppliers))
            .catch(() => { });
    }, [orderIdFromUrl, activeCompany]);

    // Quand les filtres changent, refetch
    useEffect(() => {
        if (!orderIdFromUrl) {
            fetchAllPayments();
        }
    }, [filters]);

    const handleDelete = async () => {
        setConfirmLoading(true);
        const result = await deletePayment(selectedPayment.id);
        setConfirmLoading(false);
        if (result.success) toast.success('Paiement supprimé.');
        else toast.error(result.message);
        setConfirmOpen(false);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    {orderIdFromUrl && (
                        <button onClick={() => router.push('/shop/supplier-orders')} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1">
                            <ArrowLeft size={14} /> Retour aux commandes
                        </button>
                    )}
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard size={24} className="text-brand-600" />
                        {currentOrder
                            ? `Paiements - ${currentOrder.order_number}`
                            : 'Paiements fournisseurs'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {currentOrder
                            ? `${currentOrder.supplier_name} • Reste à payer : ${Number(currentOrder.remaining_balance).toLocaleString()} FCFA`
                            : 'Tous les paiements, liés aux commandes ou globaux'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {currentOrder && currentOrder.status !== 'canceled' && (
                        <Button onClick={() => setOrderPaymentModalOpen(true)}>
                            <Plus size={16} className="mr-2" />Paiement pour cette commande
                        </Button>
                    )}
                    {!orderIdFromUrl && (
                        <Button variant="outline" onClick={() => setGlobalModalOpen(true)}>
                            <Plus size={16} className="mr-2" />Paiement global
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-xs text-gray-500">Total paiements</p>
                    <p className="text-xl font-bold">{stats?.total_payments || payments.length}</p>
                </div>
                <div className="bg-blue-50 rounded-xl border p-4">
                    <p className="text-xs text-gray-500">Montant total</p>
                    <p className="text-xl font-bold">{Number(stats?.total_amount || 0).toLocaleString()} FCFA</p>
                </div>
                <div className="bg-green-50 rounded-xl border p-4">
                    <p className="text-xs text-gray-500">Liés aux commandes</p>
                    <p className="text-xl font-bold">{Number(stats?.linked_amount || 0).toLocaleString()} FCFA</p>
                </div>
                <div className="bg-purple-50 rounded-xl border p-4">
                    <p className="text-xs text-gray-500">Globaux</p>
                    <p className="text-xl font-bold">{Number(stats?.global_amount || 0).toLocaleString()} FCFA</p>
                </div>
            </div>

            {/* Filtres (masqués si commande spécifique) */}
            {!orderIdFromUrl && (
                <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
                    <div className="flex-1 min-w-[200px] flex gap-2">
                        <Input placeholder="Rechercher..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && setFilters({ search: searchValue })} />
                        <Button variant="outline" size="icon" onClick={() => setFilters({ search: searchValue })}><Search size={16} /></Button>
                    </div>
                    <Select value={filters.supplier_id || 'all'} onValueChange={(v) => setFilters({ supplier_id: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Fournisseur" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.company_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.order_id || 'all'} onValueChange={(v) => setFilters({ order_id: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="global">Paiements globaux</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filters.payment_method || 'all'} onValueChange={(v) => setFilters({ payment_method: v === 'all' ? '' : v })}>
                        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Méthode" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            <SelectItem value="cash">Espèces</SelectItem>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                            <SelectItem value="bank_transfer">Virement</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="date" value={filters.date_from} onChange={(e) => setFilters({ date_from: e.target.value })} className="w-[150px]" placeholder="Du" />
                    <Input type="date" value={filters.date_to} onChange={(e) => setFilters({ date_to: e.target.value })} className="w-[150px]" placeholder="Au" />
                    {(filters.search || filters.supplier_id || filters.order_id || filters.payment_method || filters.date_from) && (
                        <Button variant="ghost" onClick={() => { setSearchValue(''); setFilters({ search: '', supplier_id: '', order_id: '', payment_method: '', date_from: '', date_to: '' }); }} className="text-red-500"><X size={16} className="mr-1" />Effacer</Button>
                    )}
                </div>
            )}

            {/* Table */}
            {isLoading ? (
                <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
            ) : payments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                    <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="font-medium text-gray-400">Aucun paiement trouvé</p>
                    {currentOrder && currentOrder.status !== 'canceled' && (
                        <Button className="mt-4" onClick={() => setOrderPaymentModalOpen(true)}>
                            <Plus size={16} className="mr-2" />Ajouter un paiement
                        </Button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full">
                        <thead><tr className="border-b bg-gray-50">
                            <th className="text-left p-3 text-sm font-medium">Date</th>
                            <th className="text-left p-3 text-sm font-medium">Fournisseur</th>
                            <th className="text-right p-3 text-sm font-medium">Montant</th>
                            <th className="text-left p-3 text-sm font-medium">Méthode</th>
                            <th className="text-left p-3 text-sm font-medium">Référence</th>
                            {!orderIdFromUrl && <th className="text-left p-3 text-sm font-medium">Commande</th>}
                            <th className="text-center p-3 text-sm font-medium">Type</th>
                            <th className="text-right p-3 text-sm font-medium">Actions</th>
                        </tr></thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-3 text-sm">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</td>
                                    <td className="p-3 text-sm font-medium">{p.supplier_name}</td>
                                    <td className="p-3 text-sm text-right font-medium">{Number(p.amount).toLocaleString()} FCFA</td>
                                    <td className="p-3 text-sm capitalize">{p.payment_method?.replace('_', ' ')}</td>
                                    <td className="p-3 text-sm text-gray-500">{p.payment_reference || '-'}</td>
                                    {!orderIdFromUrl && <td className="p-3 text-sm">{p.order_number || '-'}</td>}
                                    <td className="p-3 text-center">
                                        {p.supplier_order_id ? (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Commande</span>
                                        ) : (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Global</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setSelectedPayment(p); setConfirmOpen(true); }}>
                                            <Trash2 size={14} className="mr-1" />Supprimer
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <Pagination><PaginationContent>
                    <PaginationItem><PaginationPrevious onClick={() => setPage(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} /></PaginationItem>
                    <PaginationItem><span className="text-sm text-gray-500 px-4">Page {pagination.page} sur {pagination.total_pages}</span></PaginationItem>
                    <PaginationItem><PaginationNext onClick={() => setPage(Math.min(pagination.total_pages, pagination.page + 1))} disabled={pagination.page === pagination.total_pages} /></PaginationItem>
                </PaginationContent></Pagination>
            )}

            {/* Modals */}
            <GlobalPaymentModal isOpen={globalModalOpen} onClose={() => setGlobalModalOpen(false)} />

            {currentOrder && (
                <PaymentFormModal
                    isOpen={orderPaymentModalOpen}
                    onClose={() => setOrderPaymentModalOpen(false)}
                    orderId={currentOrder.id}
                    orderNumber={currentOrder.order_number}
                    remainingBalance={currentOrder.remaining_balance}
                    isOrderPayment={true}
                />
            )}

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Supprimer ce paiement"
                description={`Supprimer le paiement de ${Number(selectedPayment?.amount).toLocaleString()} FCFA ?`}
                confirmLabel="Supprimer"
                confirmVariant="destructive"
                isLoading={confirmLoading}
            />
        </div>
    );
}