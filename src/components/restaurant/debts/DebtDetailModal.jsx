// components/restaurant/DebtDetailModal.jsx
'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from '@/store/companyStore';
import { User, Phone, Calendar, Receipt, Utensils } from 'lucide-react';

const statusConfig = {
    pending: { label: 'En attente', className: 'bg-amber-100 text-amber-700' },
    partial: { label: 'Partiel', className: 'bg-blue-100 text-blue-700' },
    paid: { label: 'Payé', className: 'bg-green-100 text-green-700' },
    overdue: { label: 'En retard', className: 'bg-red-100 text-red-700' },
    canceled: { label: 'Annulé', className: 'bg-gray-100 text-gray-600' },
};

export default function DebtDetailModal({ isOpen, onClose, debtId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const activeCompany = useCompanyStore((s) => s.activeCompany);

    useEffect(() => {
        if (isOpen && debtId && activeCompany?.id) {
            setLoading(true);
            restaurantApi.getDebtById(debtId, activeCompany.id)
                .then(r => setData(r.data.data.debt))
                .finally(() => setLoading(false));
        }
    }, [isOpen, debtId, activeCompany]);

    if (!isOpen) return null;
    const debt = data;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{loading ? 'Chargement...' : `Dette ${debt?.sale_number || ''}`}</DialogTitle></DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
                ) : debt ? (
                    <div className="space-y-4">
                        {/* Client */}
                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><User size={18} className="text-red-500" /></div>
                            <div>
                                <p className="font-semibold">{debt.client_name}</p>
                                {debt.client_phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} />{debt.client_phone}</p>}
                            </div>
                            <div className="ml-auto"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[debt.status]?.className}`}>{statusConfig[debt.status]?.label}</span></div>
                        </div>

                        {/* Montants */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Total</p><p className="text-lg font-bold">{Number(debt.total_amount).toLocaleString()} F</p></div>
                            <div className="bg-green-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Payé</p><p className="text-lg font-bold">{Number(debt.total_paid).toLocaleString()} F</p></div>
                            <div className="bg-red-50 rounded-lg p-3 text-center"><p className="text-xs text-gray-500">Restant</p><p className="text-lg font-bold">{Number(debt.remaining_amount).toLocaleString()} F</p></div>
                        </div>

                        {debt.due_date && (
                            <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar size={14} />Échéance : {new Date(debt.due_date).toLocaleDateString('fr-FR')}</div>
                        )}

                        {/* Plats */}
                        {debt.sale_items?.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Utensils size={14} />Plats commandés</p>
                                <div className="space-y-1.5">
                                    {debt.sale_items.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                                            <span>{item.product_name} ×{item.quantity}</span>
                                            <span className="font-medium">{Number(item.total_price).toLocaleString()} F</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Paiements */}
                        {debt.payments?.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Receipt size={14} />Historique des paiements</p>
                                <div className="space-y-1.5">
                                    {debt.payments.map(p => (
                                        <div key={p.id} className="flex justify-between text-sm p-2 bg-green-50 rounded-lg">
                                            <div>
                                                <span className="font-medium">{Number(p.amount).toLocaleString()} F</span>
                                                <span className="text-xs text-gray-500 ml-2">{p.payment_method?.replace('_', ' ')}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(p.payment_date).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}