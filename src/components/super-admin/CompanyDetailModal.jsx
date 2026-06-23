// components/super-admin/CompanyDetailModal.jsx
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
import { superAdminApi } from '@/lib/api/superAdmin';
import { Ban, CheckCircle, Building2, Users, Package, TrendingUp, CreditCard } from 'lucide-react';

const statusConfig = {
    active: { label: 'Actif', className: 'bg-green-100 text-green-700' },
    past_due: { label: 'En retard', className: 'bg-amber-100 text-amber-700' },
    canceled: { label: 'Annulé', className: 'bg-red-100 text-red-700' },
    expired: { label: 'Expiré', className: 'bg-gray-100 text-gray-700' },
};

export default function CompanyDetailModal({ isOpen, onClose, companyId, onSuspend, onReactivate }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && companyId) {
            fetchDetail();
        }
    }, [isOpen, companyId]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await superAdminApi.getCompanyDetail(companyId);
            setData(response.data.data);
        } catch (error) {
            console.error('Erreur chargement détail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {loading ? 'Chargement...' : data?.company?.name}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                    </div>
                ) : data ? (
                    <div className="space-y-6">
                        {/* Infos générales */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Type</p>
                                <p className="font-medium text-sm">{data.company.business_type_name}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Plan</p>
                                <p className="font-medium text-sm">{data.company.plan_name}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Abonnement</p>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[data.company.subscription_status]?.className}`}>
                                    {statusConfig[data.company.subscription_status]?.label}
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Statut</p>
                                {data.company.is_active ? (
                                    <span className="text-green-600 text-sm font-medium">Actif</span>
                                ) : (
                                    <span className="text-red-600 text-sm font-medium">Suspendu</span>
                                )}
                            </div>
                        </div>

                        {/* Statistiques */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <Users size={16} className="mx-auto text-blue-600 mb-1" />
                                <p className="text-lg font-bold">{data.stats.total_products}</p>
                                <p className="text-xs text-gray-500">Produits</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <Users size={16} className="mx-auto text-green-600 mb-1" />
                                <p className="text-lg font-bold">{data.stats.total_clients}</p>
                                <p className="text-xs text-gray-500">Clients</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-3 text-center">
                                <Building2 size={16} className="mx-auto text-purple-600 mb-1" />
                                <p className="text-lg font-bold">{data.stats.total_suppliers}</p>
                                <p className="text-xs text-gray-500">Fournisseurs</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3 text-center">
                                <TrendingUp size={16} className="mx-auto text-amber-600 mb-1" />
                                <p className="text-lg font-bold">{data.stats.total_sales}</p>
                                <p className="text-xs text-gray-500">Ventes</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                <CreditCard size={16} className="mx-auto text-emerald-600 mb-1" />
                                <p className="text-lg font-bold">{Number(data.stats.total_revenue).toLocaleString()}</p>
                                <p className="text-xs text-gray-500">CA (FCFA)</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="members">
                            <TabsList>
                                <TabsTrigger value="members">Membres ({data.members.length})</TabsTrigger>
                                <TabsTrigger value="sales">Ventes récentes</TabsTrigger>
                                <TabsTrigger value="invoices">Factures</TabsTrigger>
                            </TabsList>

                            <TabsContent value="members" className="mt-3">
                                {data.members.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">Aucun membre.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.members.map((m) => (
                                            <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{m.first_name} {m.last_name}</p>
                                                    <p className="text-xs text-gray-400">{m.email}</p>
                                                </div>
                                                <Badge variant="outline">{m.role}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="sales" className="mt-3">
                                {data.recent_sales.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">Aucune vente.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.recent_sales.map((s) => (
                                            <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{s.sale_number}</p>
                                                    <p className="text-xs text-gray-400">{new Date(s.sale_date).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <p className="font-medium">{Number(s.total_amount).toLocaleString()} FCFA</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="invoices" className="mt-3">
                                {data.invoices.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">Aucune facture.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.invoices.map((inv) => (
                                            <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{inv.plan_name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(inv.period_start).toLocaleDateString('fr-FR')} → {new Date(inv.period_end).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{Number(inv.amount).toLocaleString()} {inv.currency}</p>
                                                    <span className={`text-xs ${inv.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {inv.status === 'paid' ? 'Payée' : 'En attente'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            {data.company.is_active ? (
                                <Button
                                    variant="outline"
                                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                                    onClick={() => {
                                        onClose();
                                        onSuspend(data.company);
                                    }}
                                >
                                    <Ban size={16} className="mr-2" /> Suspendre
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                    onClick={() => {
                                        onClose();
                                        onReactivate(data.company);
                                    }}
                                >
                                    <CheckCircle size={16} className="mr-2" /> Réactiver
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}