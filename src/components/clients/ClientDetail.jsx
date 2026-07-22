'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, MapPin, ShoppingBag, DollarSign, Calendar, FileText, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ExportClientProfilePDFButton from './ExportClientProfilePDFButton';

export default function ClientDetail({ client, onBack, onEdit }) {
    if (!client) return null;

    const stats = client.purchase_stats || {};

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft size={18} /></Button>
                    <div>
                        <h1 className="text-xl font-bold">{client.full_name}</h1>
                        <p className="text-sm text-gray-500">Client depuis {new Date(client.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ExportClientProfilePDFButton client={client} />
                    <Button variant="outline" onClick={() => onEdit(client)}>
                        <Edit size={16} className="mr-2" /> Modifier
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Colonne gauche */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Total achats', value: stats.total_purchases || 0, icon: ShoppingBag },
                            { label: 'Total dépensé', value: `${parseInt(stats.total_spent || 0).toLocaleString()} F`, icon: DollarSign },
                            { label: 'Panier moyen', value: `${parseInt(stats.average_purchase || 0).toLocaleString()} F`, icon: ShoppingBag },
                            { label: 'Dette actuelle', value: `${parseInt(client.current_debt || 0).toLocaleString()} F`, icon: DollarSign, warn: client.current_debt > 0 },
                        ].map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="rounded-xl border bg-white p-4"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <s.icon size={14} className={s.warn ? 'text-red-500' : 'text-gray-400'} />
                                    <span className="text-xs text-gray-500">{s.label}</span>
                                </div>
                                <p className={cn('font-semibold', s.warn && 'text-red-600')}>{s.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Historique des ventes */}
                    <div className="rounded-xl border bg-white p-5">
                        <h3 className="font-medium mb-4">Historique des ventes</h3>
                        {client.recent_sales?.length > 0 ? (
                            <div className="space-y-3">
                                {client.recent_sales.map((sale) => (
                                    <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="text-sm font-medium">{sale.sale_number}</p>
                                            <p className="text-xs text-gray-400">{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{parseInt(sale.total_amount).toLocaleString()} F</p>
                                            <span className={cn(
                                                'text-xs rounded-full px-2 py-0.5',
                                                sale.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    sale.payment_status === 'debt' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'
                                            )}>
                                                {sale.payment_status === 'paid' ? 'Payé' : sale.payment_status === 'debt' ? 'Dette' : sale.payment_status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">Aucune vente enregistrée.</p>
                        )}
                    </div>

                    {/* Top produits */}
                    {client.top_products?.length > 0 && (
                        <div className="rounded-xl border bg-white p-5">
                            <h3 className="font-medium mb-4">Produits les plus achetés</h3>
                            <div className="space-y-2">
                                {client.top_products.map((p) => (
                                    <div key={p.id} className="flex justify-between text-sm">
                                        <span>{p.name}</span>
                                        <span className="text-gray-500">x{p.total_quantity} • {parseInt(p.total_spent).toLocaleString()} F</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Colonne droite */}
                <div className="space-y-4">
                    {/* Infos contact */}
                    <div className="rounded-xl border bg-white p-5">
                        <h3 className="font-medium mb-3">Contact</h3>
                        <div className="space-y-3 text-sm">
                            {client.phone && <p className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {client.phone}</p>}
                            {client.email && <p className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {client.email}</p>}
                            {client.city && <p className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> {client.city}</p>}
                            {client.address && <p className="text-sm text-gray-500 mt-1">{client.address}</p>}
                        </div>
                    </div>

                    {/* Dettes actives */}
                    {client.active_debts?.length > 0 && (
                        <div className="rounded-xl border bg-white p-5">
                            <h3 className="font-medium mb-3 text-red-600">Dettes en cours</h3>
                            <div className="space-y-2">
                                {client.active_debts.map((debt) => (
                                    <div key={debt.id} className="text-sm border-b pb-2 last:border-0">
                                        <p className="font-medium">{debt.sale_number || `Dette #${debt.id}`}</p>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-gray-500">Reste à payer</span>
                                            <span className="text-red-600 font-medium">{parseInt(debt.remaining_amount).toLocaleString()} F</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {client.notes && (
                        <div className="rounded-xl border bg-white p-5">
                            <h3 className="font-medium mb-3 flex items-center gap-2"><FileText size={14} /> Notes</h3>
                            <p className="text-sm text-gray-600">{client.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}