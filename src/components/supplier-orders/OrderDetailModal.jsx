// components/supplier-orders/OrderDetailModal.jsx (REMPLACER)
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supplierOrdersApi } from '@/lib/api/supplierOrders';
import useCompanyStore from '@/store/companyStore';
import ReceiveItemsModal from './ReceiveItemsModal';
import { Package, Truck, Calendar, CreditCard, Pencil, Ban, Receipt, Boxes } from 'lucide-react';

const statusConfig = {
    draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700' },
    ordered: { label: 'Commandée', className: 'bg-blue-100 text-blue-700' },
    confirmed: { label: 'Confirmée', className: 'bg-indigo-100 text-indigo-700' },
    partially_received: { label: 'Partiellement reçue', className: 'bg-amber-100 text-amber-700' },
    received: { label: 'Reçue', className: 'bg-green-100 text-green-700' },
    canceled: { label: 'Annulée', className: 'bg-red-100 text-red-700' },
    disputed: { label: 'Litige', className: 'bg-orange-100 text-orange-700' },
};

export default function OrderDetailModal({ isOpen, onClose, orderId, onEdit }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [receiveOpen, setReceiveOpen] = useState(false);
    const activeCompany = useCompanyStore((s) => s.activeCompany);
    const router = useRouter();

    useEffect(() => {
        if (isOpen && orderId && activeCompany?.id) {
            setLoading(true);
            supplierOrdersApi.getById(orderId, activeCompany.id)
                .then(r => setData(r.data.data))
                .finally(() => setLoading(false));
        }
    }, [isOpen, orderId, activeCompany]);

    if (!isOpen) return null;
    const order = data?.order;
    const items = data?.items || [];
    const payments = data?.payments || [];

    // Vérifier si la réception est possible
    const canReceive = order && !['draft', 'canceled', 'received'].includes(order.status);
    // Vérifier s'il reste des articles à recevoir
    const hasRemainingItems = items.some(
        item => parseFloat(item.quantity_received || 0) < parseFloat(item.quantity_ordered)
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>{loading ? 'Chargement...' : order?.order_number}</span>
                            {order && (
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status]?.className}`}>
                                    {statusConfig[order.status]?.label}
                                </span>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                        </div>
                    ) : data ? (
                        <div className="space-y-4">
                            {/* Infos générales */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Fournisseur</p>
                                    <p className="font-medium text-sm">{order.supplier_name}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Date</p>
                                    <p className="text-sm">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                                {order.reference && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Référence</p>
                                        <p className="text-sm">{order.reference}</p>
                                    </div>
                                )}
                                {order.expected_at && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Livraison prévue</p>
                                        <p className="text-sm">{new Date(order.expected_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                )}
                            </div>

                            {/* Résumé financier */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="text-lg font-bold">{Number(order.total_amount).toLocaleString()} FCFA</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Payé</p>
                                    <p className="text-lg font-bold text-green-700">{Number(order.total_paid).toLocaleString()} FCFA</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Reste à payer</p>
                                    <p className="text-lg font-bold text-red-700">{Number(order.remaining_balance).toLocaleString()} FCFA</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="items">
                                <TabsList>
                                    <TabsTrigger value="items">
                                        <Package size={14} className="mr-1" />
                                        Articles ({items.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="payments">
                                        <CreditCard size={14} className="mr-1" />
                                        Paiements ({payments.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="items" className="mt-3">
                                    {items.length === 0 ? (
                                        <p className="text-sm text-gray-500 py-4">Aucun article.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {items.map(item => {
                                                const remaining = parseFloat(item.quantity_ordered) - parseFloat(item.quantity_received || 0);
                                                return (
                                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{item.product_name}</p>
                                                            <p className="text-xs text-gray-400">
                                                                {Number(item.unit_cost).toLocaleString()} FCFA × {item.quantity_ordered}
                                                                {item.variant_name && <span className="ml-2">({item.variant_name})</span>}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-sm">{Number(item.total_cost).toLocaleString()} FCFA</p>
                                                            {parseFloat(item.quantity_received) > 0 ? (
                                                                <p className="text-xs text-green-600">
                                                                    Reçu : {item.quantity_received}
                                                                    {remaining > 0 && <span className="text-amber-500 ml-1">(Reste : {remaining})</span>}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-amber-500">En attente de réception</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="payments" className="mt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-500">{payments.length} paiement(s)</span>
                                        {order.status !== 'canceled' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => { onClose(); router.push(`/shop/supplier-payments?order=${orderId}`); }}
                                            >
                                                <Receipt size={14} className="mr-1" /> Gérer les paiements
                                            </Button>
                                        )}
                                    </div>
                                    {payments.length === 0 ? (
                                        <p className="text-sm text-gray-500">Aucun paiement.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {payments.map(p => (
                                                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-sm">{Number(p.amount).toLocaleString()} FCFA</p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(p.payment_date).toLocaleDateString('fr-FR')} • {p.payment_method?.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                    {p.note && <p className="text-xs text-gray-500 max-w-[200px] truncate">{p.note}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* Notes */}
                            {order.notes && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Notes</p>
                                    <p className="text-sm">{order.notes}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                {/* Bouton Réceptionner */}
                                {canReceive && hasRemainingItems && (
                                    <Button
                                        variant="outline"
                                        className="text-green-600 border-green-300 hover:bg-green-50"
                                        onClick={() => setReceiveOpen(true)}
                                    >
                                        <Boxes size={16} className="mr-2" />
                                        Réceptionner
                                    </Button>
                                )}

                                {/* Bouton Modifier */}
                                {['draft', 'ordered', 'confirmed'].includes(order.status) && (
                                    <Button variant="outline" onClick={() => onEdit(order)}>
                                        <Pencil size={16} className="mr-2" />Modifier
                                    </Button>
                                )}

                                {/* Bouton Paiements */}
                                {order.status !== 'canceled' && (
                                    <Button variant="outline" onClick={() => { onClose(); router.push(`/shop/supplier-payments?order=${orderId}`); }}>
                                        <CreditCard size={16} className="mr-2" />Paiements
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Modal de réception */}
            {order && (
                <ReceiveItemsModal
                    isOpen={receiveOpen}
                    onClose={() => {
                        setReceiveOpen(false);
                        // Rafraîchir les données
                        if (orderId && activeCompany?.id) {
                            supplierOrdersApi.getById(orderId, activeCompany.id)
                                .then(r => setData(r.data.data));
                        }
                    }}
                    order={order}
                    items={items}
                />
            )}
        </>
    );
}