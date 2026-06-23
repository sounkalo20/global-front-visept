// components/suppliers/SupplierDetailModal.jsx
'use client';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { suppliersApi } from '@/lib/api/suppliers';
import useCompanyStore from '@/store/companyStore';
import {
    Pencil,
    Trash2,
    Power,
    PowerOff,
    Truck,
    Phone,
    Mail,
    MapPin,
    FileText,
    ShoppingCart,
    CreditCard,
} from 'lucide-react';

export default function SupplierDetailModal({
    isOpen,
    onClose,
    supplierId,
    onEdit,
    onToggleStatus,
    onDelete,
}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const activeCompany = useCompanyStore((s) => s.activeCompany);

    useEffect(() => {
        if (isOpen && supplierId && activeCompany?.id) {
            fetchDetail();
        }
    }, [isOpen, supplierId, activeCompany]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await suppliersApi.getById(supplierId, activeCompany.id);
            setData(response.data.data);
        } catch (error) {
            console.error('Erreur chargement détail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const supplier = data?.supplier;
    const stats = data?.stats;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {loading ? 'Chargement...' : supplier?.company_name}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        {/* Infos */}
                        <div className="grid grid-cols-2 gap-3">
                            {supplier.contact_name && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Contact</p>
                                    <p className="font-medium text-sm">{supplier.contact_name}</p>
                                </div>
                            )}
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500"><Phone size={12} className="inline mr-1" /> Téléphone</p>
                                <p className="font-medium text-sm">{supplier.phone}</p>
                            </div>
                            {supplier.email && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500"><Mail size={12} className="inline mr-1" /> Email</p>
                                    <p className="font-medium text-sm truncate">{supplier.email}</p>
                                </div>
                            )}
                            {supplier.city && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500"><MapPin size={12} className="inline mr-1" /> Localisation</p>
                                    <p className="font-medium text-sm">{[supplier.city, supplier.country].filter(Boolean).join(', ')}</p>
                                </div>
                            )}
                        </div>

                        {supplier.address && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Adresse</p>
                                <p className="text-sm">{supplier.address}</p>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <ShoppingCart size={16} className="mx-auto text-blue-600 mb-1" />
                                <p className="text-lg font-bold">{stats?.total_orders || 0}</p>
                                <p className="text-xs text-gray-500">Commandes</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <CreditCard size={16} className="mx-auto text-green-600 mb-1" />
                                <p className="text-lg font-bold">{Number(stats?.total_purchases_amount || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Total achats</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3 text-center">
                                <CreditCard size={16} className="mx-auto text-amber-600 mb-1" />
                                <p className="text-lg font-bold">{Number(stats?.total_paid || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Payé</p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3 text-center">
                                <CreditCard size={16} className="mx-auto text-red-600 mb-1" />
                                <p className="text-lg font-bold">{Number(supplier.current_balance || 0).toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Solde dû</p>
                            </div>
                        </div>

                        {supplier.notes && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1"><FileText size={12} className="inline mr-1" /> Notes</p>
                                <p className="text-sm">{supplier.notes}</p>
                            </div>
                        )}

                        {/* Tabs */}
                        <Tabs defaultValue="orders">
                            <TabsList>
                                <TabsTrigger value="orders">Commandes ({data.recent_orders.length})</TabsTrigger>
                                <TabsTrigger value="payments">Paiements ({data.recent_payments.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="orders" className="mt-3">
                                {data.recent_orders.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">Aucune commande.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.recent_orders.map((o) => (
                                            <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{o.order_number}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(o.created_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-sm">{Number(o.total_amount).toLocaleString()} FCFA</p>
                                                    <Badge variant="outline" className="text-xs">{o.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="payments" className="mt-3">
                                {data.recent_payments.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">Aucun paiement.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.recent_payments.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{Number(p.amount).toLocaleString()} FCFA</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(p.payment_date).toLocaleDateString('fr-FR')} • {p.payment_method}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">{p.payment_method}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" className="text-red-600" onClick={() => onDelete(supplier)}>
                                <Trash2 size={16} className="mr-2" /> Supprimer
                            </Button>
                            <Button
                                variant="outline"
                                className={supplier.is_active ? 'text-amber-600' : 'text-green-600'}
                                onClick={() => onToggleStatus(supplier)}
                            >
                                {supplier.is_active ? <PowerOff size={16} className="mr-2" /> : <Power size={16} className="mr-2" />}
                                {supplier.is_active ? 'Désactiver' : 'Activer'}
                            </Button>
                            <Button onClick={() => onEdit(supplier)}>
                                <Pencil size={16} className="mr-2" /> Modifier
                            </Button>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}