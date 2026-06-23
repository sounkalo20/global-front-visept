// components/super-admin/PlanDetailModal.jsx
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
import {
    Pencil,
    Trash2,
    Power,
    PowerOff,
    Check,
    X,
    Infinity,
    Building2,
    TrendingUp,
    Users,
    Package,
    UserCheck,
    Calendar,
} from 'lucide-react';

export default function PlanDetailModal({
    isOpen,
    onClose,
    planId,
    onEdit,
    onToggleStatus,
    onDelete,
}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && planId) {
            fetchDetail();
        }
    }, [isOpen, planId]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await superAdminApi.getPlanDetail(planId);
            setData(response.data.data);
        } catch (error) {
            console.error('Erreur chargement détail plan:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const plan = data?.plan;
    const features = plan?.features
        ? typeof plan.features === 'string'
            ? JSON.parse(plan.features)
            : plan.features
        : {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {loading ? 'Chargement...' : plan?.name}
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
                                <p className="text-xs text-gray-500">Code</p>
                                <code className="text-sm font-mono">{plan.code}</code>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Prix / mois</p>
                                <p className="font-bold">{Number(plan.price_monthly).toLocaleString()} FCFA</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Prix / an</p>
                                <p className="font-bold">{Number(plan.price_yearly).toLocaleString()} FCFA</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Statut</p>
                                {plan.is_active ? (
                                    <span className="text-green-600 text-sm font-medium">Actif</span>
                                ) : (
                                    <span className="text-red-600 text-sm font-medium">Inactif</span>
                                )}
                            </div>
                        </div>

                        {/* Limites */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3">Limites</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-blue-50 rounded-lg p-4 text-center">
                                    <Users size={20} className="mx-auto text-blue-600 mb-2" />
                                    <p className="text-xs text-gray-500">Employés max</p>
                                    <p className="text-lg font-bold">{plan.max_employees ?? <Infinity size={16} className="inline" />}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4 text-center">
                                    <Package size={20} className="mx-auto text-green-600 mb-2" />
                                    <p className="text-xs text-gray-500">Produits max</p>
                                    <p className="text-lg font-bold">{plan.max_products ?? <Infinity size={16} className="inline" />}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 text-center">
                                    <UserCheck size={20} className="mx-auto text-purple-600 mb-2" />
                                    <p className="text-xs text-gray-500">Clients max</p>
                                    <p className="text-lg font-bold">{plan.max_clients ?? <Infinity size={16} className="inline" />}</p>
                                </div>
                            </div>
                        </div>

                        {/* Fonctionnalités */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3">Fonctionnalités</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.keys(features).length === 0 ? (
                                    <p className="text-sm text-gray-400 col-span-2">Aucune fonctionnalité définie.</p>
                                ) : (
                                    Object.entries(features).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                                            {value ? (
                                                <Check size={16} className="text-green-500" />
                                            ) : (
                                                <X size={16} className="text-red-400" />
                                            )}
                                            <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Statistiques */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3">Statistiques</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <Building2 size={16} className="mx-auto text-gray-500 mb-1" />
                                    <p className="text-lg font-bold">{data.stats.total_companies}</p>
                                    <p className="text-xs text-gray-500">Entreprises</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <Check size={16} className="mx-auto text-green-500 mb-1" />
                                    <p className="text-lg font-bold">{data.stats.active_companies}</p>
                                    <p className="text-xs text-gray-500">Actives</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <TrendingUp size={16} className="mx-auto text-blue-500 mb-1" />
                                    <p className="text-lg font-bold">{Number(data.stats.estimated_monthly_revenue).toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">Revenu / mois</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <Calendar size={16} className="mx-auto text-purple-500 mb-1" />
                                    <p className="text-lg font-bold">{Number(data.stats.estimated_yearly_revenue).toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">Revenu / an</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="companies">
                            <TabsList>
                                <TabsTrigger value="companies">Entreprises ({data.recent_companies.length})</TabsTrigger>
                                <TabsTrigger value="invoices">Factures ({data.recent_invoices.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="companies" className="mt-3">
                                {data.recent_companies.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">Aucune entreprise sur ce plan.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.recent_companies.map((c) => (
                                            <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{c.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        Depuis le {new Date(c.created_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">{c.subscription_status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="invoices" className="mt-3">
                                {data.recent_invoices.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4">Aucune facture.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {data.recent_invoices.map((inv) => (
                                            <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{inv.company_name}</p>
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
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => onDelete(plan)}
                            >
                                <Trash2 size={16} className="mr-2" /> Supprimer
                            </Button>
                            <Button
                                variant="outline"
                                className={plan.is_active
                                    ? 'text-amber-600 border-amber-300 hover:bg-amber-50'
                                    : 'text-green-600 border-green-300 hover:bg-green-50'
                                }
                                onClick={() => onToggleStatus(plan)}
                            >
                                {plan.is_active ? (
                                    <><PowerOff size={16} className="mr-2" /> Désactiver</>
                                ) : (
                                    <><Power size={16} className="mr-2" /> Activer</>
                                )}
                            </Button>
                            <Button onClick={() => onEdit(plan)}>
                                <Pencil size={16} className="mr-2" /> Modifier
                            </Button>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}