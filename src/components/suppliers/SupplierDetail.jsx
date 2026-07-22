'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, MapPin, ShoppingCart, CreditCard, FileText, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ExportSupplierProfilePDFButton from './ExportSupplierProfilePDFButton';

export default function SupplierDetail({ data, onBack, onEdit, onToggleStatus, onDelete }) {
    if (!data || !data.supplier) return null;

    const { supplier, stats, recent_orders, recent_payments } = data;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft size={18} /></Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">{supplier.company_name}</h1>
                            {!supplier.is_active && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inactif</Badge>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">Ajouté le {new Date(supplier.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ExportSupplierProfilePDFButton data={data} />
                    <Button variant="outline" onClick={() => onEdit(supplier)}>
                        <Edit size={16} className="mr-2" /> Modifier
                    </Button>
                    <Button variant="outline" onClick={() => onToggleStatus(supplier)} className={supplier.is_active ? 'text-amber-600' : 'text-green-600'}>
                        {supplier.is_active ? <PowerOff size={16} className="mr-2" /> : <Power size={16} className="mr-2" />}
                        {supplier.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button variant="outline" className="text-red-600" onClick={() => onDelete(supplier)}>
                        <Trash2 size={16} className="mr-2" /> Supprimer
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Colonne gauche (Stats et historiques) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border bg-white p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <ShoppingCart size={14} className="text-blue-500" />
                                <span className="text-xs text-gray-500">Commandes</span>
                            </div>
                            <p className="font-semibold text-lg">{stats?.total_orders || 0}</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border bg-white p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CreditCard size={14} className="text-green-500" />
                                <span className="text-xs text-gray-500">Total achats</span>
                            </div>
                            <p className="font-semibold text-lg">{Number(stats?.total_purchases_amount || 0).toLocaleString()} F</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border bg-white p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CreditCard size={14} className="text-amber-500" />
                                <span className="text-xs text-gray-500">Total payé</span>
                            </div>
                            <p className="font-semibold text-lg">{Number(stats?.total_paid || 0).toLocaleString()} F</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border bg-white p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CreditCard size={14} className={parseFloat(supplier.current_balance) > 0 ? 'text-red-500' : 'text-gray-400'} />
                                <span className="text-xs text-gray-500">Solde dû</span>
                            </div>
                            <p className={cn("font-semibold text-lg", parseFloat(supplier.current_balance) > 0 && "text-red-600")}>
                                {Number(supplier.current_balance || 0).toLocaleString()} F
                            </p>
                        </motion.div>
                    </div>

                    {/* Dernières commandes */}
                    <div className="rounded-xl border bg-white p-5">
                        <h3 className="font-medium mb-4">Dernières commandes</h3>
                        {recent_orders && recent_orders.length > 0 ? (
                            <div className="space-y-3">
                                {recent_orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="text-sm font-medium">{order.order_number}</p>
                                            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{Number(order.total_amount).toLocaleString()} F</p>
                                            <Badge variant="outline" className={cn(
                                                "text-xs font-normal mt-1",
                                                order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700'
                                            )}>
                                                {order.status === 'completed' ? 'Livré' : order.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">Aucune commande enregistrée.</p>
                        )}
                    </div>

                    {/* Derniers paiements */}
                    <div className="rounded-xl border bg-white p-5">
                        <h3 className="font-medium mb-4">Derniers paiements</h3>
                        {recent_payments && recent_payments.length > 0 ? (
                            <div className="space-y-3">
                                {recent_payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                        <div>
                                            <p className="text-sm font-medium">{Number(payment.amount).toLocaleString()} F</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(payment.payment_date).toLocaleDateString('fr-FR')} • {payment.payment_method}
                                            </p>
                                        </div>
                                        {payment.reference && (
                                            <span className="text-xs text-gray-500 font-medium">Ref: {payment.reference}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4">Aucun paiement enregistré.</p>
                        )}
                    </div>
                </div>

                {/* Colonne droite (Contact) */}
                <div className="space-y-4">
                    {/* Infos contact */}
                    <div className="rounded-xl border bg-white p-5">
                        <h3 className="font-medium mb-3">Informations & Contact</h3>
                        <div className="space-y-4 text-sm">
                            {supplier.contact_name && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Personne à contacter</p>
                                    <p className="font-medium">{supplier.contact_name}</p>
                                </div>
                            )}
                            {supplier.phone && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><Phone size={12} /> Téléphone</p>
                                    <p>{supplier.phone}</p>
                                </div>
                            )}
                            {supplier.email && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><Mail size={12} /> Email</p>
                                    <p className="break-all">{supplier.email}</p>
                                </div>
                            )}
                            {(supplier.city || supplier.country || supplier.address) && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1"><MapPin size={12} /> Localisation</p>
                                    <p>{supplier.address}</p>
                                    <p>{[supplier.city, supplier.country].filter(Boolean).join(', ')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    {supplier.notes && (
                        <div className="rounded-xl border bg-white p-5">
                            <h3 className="font-medium mb-3 flex items-center gap-2"><FileText size={14} /> Notes</h3>
                            <p className="text-sm text-gray-600">{supplier.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
