'use client';

import { motion } from 'framer-motion';
import {
    ArrowLeft,
    User,
    Phone,
    Calendar,
    CreditCard,
    AlertCircle,
    ShoppingCart,
    UserCheck,
    ReceiptText
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ================= STATUS ================= */
const statusBadge = (status) => {
    const map = {
        pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
        partial: { label: 'Partiel', color: 'bg-amber-100 text-amber-700' },
        paid: { label: 'Payé', color: 'bg-green-100 text-green-700' },
        overdue: { label: 'En retard', color: 'bg-red-100 text-red-700' },
        canceled: { label: 'Annulé', color: 'bg-gray-100 text-gray-500' },
    };

    return map[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
};

/* ================= COMPONENT ================= */
export default function DebtDetail({ debt, onBack, onAddPayment, onCancel }) {
    if (!debt) return null;

    /* ================= SAFE NUMBERS ================= */
    const total = Number(debt.total_amount || 0);
    const paid = Number(debt.total_paid || 0);
    const remaining = Number(debt.remaining_amount || 0);

    const progress = total > 0 ? (paid / total) * 100 : 0;

    const badge = statusBadge(debt.status);

    /* ================= RENDER ================= */
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft size={18} />
                    </Button>

                    <div>
                        <h1 className="text-xl font-bold">
                            Dette {debt.sale_number ? `- ${debt.sale_number}` : `#${debt.id}`}
                        </h1>
                        <p className="text-sm text-gray-500">
                            Créée le {new Date(debt.created_at).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {debt.status !== 'paid' && debt.status !== 'canceled' && (
                        <Button onClick={onAddPayment}>
                            <CreditCard size={16} className="mr-2" />
                            Ajouter un paiement
                        </Button>
                    )}

                    {debt.status !== 'canceled' && (
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-300"
                            onClick={() => onCancel(debt)}
                        >
                            <AlertCircle size={16} className="mr-2" />
                            Annuler
                        </Button>
                    )}
                </div>
            </div>

            {/* ================= GRID ================= */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* ================= LEFT ================= */}
                <div className="lg:col-span-2 space-y-4">

                    {/* ================= CLIENT ================= */}
                    <div className="rounded-xl border bg-white p-5">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <User size={16} /> Client
                        </h3>

                        <p className="font-medium">{debt.client_name}</p>

                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone size={12} /> {debt.client_phone}
                        </p>
                    </div>

                    {/* ================= SELLER ================= */}
                    <div className="rounded-xl border bg-white p-5">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <UserCheck size={16} /> Vendeur
                        </h3>

                        <p className="font-medium">
                            {debt.seller_first_name} {debt.seller_last_name}
                        </p>

                        {debt.seller_email && (
                            <p className="text-sm text-gray-500">
                                {debt.seller_email}
                            </p>
                        )}
                    </div>

                    {/* ================= SALE DETAILS ================= */}
                    <div className="rounded-xl border bg-white p-5 space-y-3">
                        <h3 className="font-medium flex items-center gap-2">
                            <ReceiptText size={16} /> Détails de la vente
                        </h3>

                        <div className="flex justify-between text-sm">
                            <span>Sous-total</span>
                            <span className="font-medium">
                                {Number(debt.sale_subtotal || debt.sale_total).toLocaleString()} F
                            </span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Remise</span>
                            <span className="text-orange-600 font-medium">
                                {debt.sale_discount_type === 'percentage'
                                    ? `${debt.sale_discount_value}%`
                                    : `${Number(debt.sale_discount_value || 0).toLocaleString()} F`}
                            </span>
                        </div>

                        <div className="flex justify-between text-sm border-t pt-2">
                            <span>Total final</span>
                            <span className="font-bold">
                                {total.toLocaleString()} F
                            </span>
                        </div>
                    </div>

                    {/* ================= PRODUCTS ================= */}
                    {debt.sale_items?.length > 0 && (
                        <div className="rounded-xl border bg-white p-5">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <ShoppingCart size={16} /> Produits
                            </h3>

                            <div className="space-y-2">
                                {debt.sale_items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between py-2 border-b last:border-0"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">
                                                {item.product_name}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {Number(item.quantity)} x {Number(item.unit_price).toLocaleString()} F
                                            </p>
                                        </div>

                                        <p className="font-medium text-sm">
                                            {Number(item.total_price).toLocaleString()} F
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ================= PAYMENTS ================= */}
                    {debt.payments?.length > 0 && (
                        <div className="rounded-xl border bg-white p-5">
                            <h3 className="font-medium mb-3">Paiements</h3>

                            <div className="space-y-2">
                                {debt.payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between py-2 border-b last:border-0"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-green-600">
                                                +{Number(payment.amount).toLocaleString()} F
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                                                {' • '}
                                                {payment.payment_method}
                                                {payment.received_by_name && ` • ${payment.received_by_name}`}
                                            </p>
                                        </div>

                                        {payment.payment_reference && (
                                            <p className="text-xs text-gray-400">
                                                Ref: {payment.payment_reference}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ================= RIGHT ================= */}
                <div className="rounded-xl border bg-white p-5 space-y-4 h-fit sticky top-4">

                    <h3 className="font-medium">Résumé</h3>

                    {/* AMOUNTS */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Total</span>
                            <span className="font-medium">{total.toLocaleString()} F</span>
                        </div>

                        <div className="flex justify-between text-green-600">
                            <span>Payé</span>
                            <span className="font-medium">{paid.toLocaleString()} F</span>
                        </div>

                        <div className="flex justify-between text-red-600 font-bold text-lg pt-2 border-t">
                            <span>Reste</span>
                            <span>{remaining.toLocaleString()} F</span>
                        </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full transition-all duration-500',
                                progress >= 100 ? 'bg-green-500' : 'bg-blue-600'
                            )}
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>

                    <p className="text-xs text-gray-400 text-center">
                        {progress.toFixed(1)}% payé
                    </p>

                    {/* STATUS */}
                    <div className="pt-3 border-t space-y-2 text-sm">
                        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', badge.color)}>
                            {badge.label}
                        </span>

                        <p className="flex items-center gap-2 text-gray-500">
                            <Calendar size={14} />
                            Échéance :{' '}
                            {debt.due_date
                                ? new Date(debt.due_date).toLocaleDateString('fr-FR')
                                : 'Non définie'}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}