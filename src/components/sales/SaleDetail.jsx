'use client';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, CreditCard, AlertCircle, Edit, Calendar,
  Receipt, Banknote, Smartphone, Building2, Package, Hash,
  Printer, Clock, Tag, ShoppingBag, UserCheck, Percent,
  CheckCircle2, XCircle, AlertTriangle as AlertTriangleIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const statusConfig = {
  paid: { label: 'Payé', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' },
  partial: { label: 'Partiel', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, dot: 'bg-amber-500' },
  debt: { label: 'Dette', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangleIcon, dot: 'bg-orange-500' },
  unpaid: { label: 'Impayé', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle, dot: 'bg-red-500' },
  canceled: { label: 'Annulé', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: XCircle, dot: 'bg-gray-400' },
};

const saleStatusConfig = {
  completed: { label: 'Complétée', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  canceled: { label: 'Annulée', color: 'bg-red-50 text-red-600 border-red-200' },
  pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const paymentMethodLabels = {
  cash: { label: 'Espèces', icon: Banknote },
  mobile_money: { label: 'Mobile Money', icon: Smartphone },
  bank_transfer: { label: 'Virement bancaire', icon: Building2 },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function SaleDetail({ sale, onBack, onCancel, editLink, variant = 'shop', onPrintReceipt }) {
  if (!sale) return null;

  const payStatus = statusConfig[sale.payment_status] || statusConfig.unpaid;
  const saleStatus = saleStatusConfig[sale.status] || saleStatusConfig.completed;
  const payMethod = paymentMethodLabels[sale.payment_method] || { label: sale.payment_method, icon: CreditCard };
  const router = useRouter();
  const isCanceled = sale.status === 'canceled';

  const subtotal = parseInt(sale.subtotal || 0);
  const discount = parseInt(sale.discount_amount || 0);
  const total = parseInt(sale.total_amount || 0);
  const paid = parseInt(sale.amount_paid || 0);
  const due = parseInt(sale.amount_due || 0);
  const paymentProgress = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ────────── HEADER HÉROÏQUE ────────── */}
      <motion.div variants={itemVariants}>
        <div className="rounded-2xl bg-white border shadow-sm overflow-hidden">
          <div className="bg-stone-900 px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft size={18} />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt size={16} className="text-stone-400" />
                    <h1 className="text-xl font-bold text-white">{sale.sale_number}</h1>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={12} className="text-stone-400" />
                    <span className="text-sm text-stone-300">
                      {new Date(sale.sale_date).toLocaleDateString('fr-FR', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                      {' à '}
                      {new Date(sale.sale_date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn('text-xs px-2.5 py-1 border', saleStatus.color)}>
                  {saleStatus.label}
                </Badge>
                <Badge className={cn('text-xs px-2.5 py-1 border', payStatus.color)}>
                  <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 inline-block', payStatus.dot)} />
                  {payStatus.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-3 bg-stone-50 flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm text-stone-500">
              <span className="font-medium text-stone-700">{sale.items?.length || 0}</span> article{(sale.items?.length || 0) > 1 ? 's' : ''} • Total{' '}
              <span className="font-bold text-stone-900">{total.toLocaleString()} F</span>
            </div>
            <div className="flex gap-2">
              {onPrintReceipt && (
                <Button variant="outline" size="sm" onClick={() => onPrintReceipt(sale)}>
                  <Printer size={14} className="mr-1.5" /> Ticket
                </Button>
              )}
              {!isCanceled && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(editLink + `/${sale.id}/edit`)}
                  >
                    <Edit size={14} className="mr-1.5" /> Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancel(sale)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <AlertCircle size={14} className="mr-1.5" /> Annuler
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ────────── QUICK INFO CARDS ────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShoppingBag size={16} className="text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-stone-500">Total</span>
            </div>
            <p className="text-xl font-bold text-stone-900">{total.toLocaleString()} <span className="text-sm font-normal text-stone-400">F</span></p>
          </CardContent>
        </Card>

        {/* Mode de paiement */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <payMethod.icon size={16} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-stone-500">Paiement</span>
            </div>
            <p className="text-sm font-semibold text-stone-900">{payMethod.label}</p>
            {sale.payment_reference && (
              <p className="text-xs text-stone-400 mt-0.5 truncate">Réf : {sale.payment_reference}</p>
            )}
          </CardContent>
        </Card>

        {/* Client */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <User size={16} className="text-purple-600" />
              </div>
              <span className="text-xs font-medium text-stone-500">Client</span>
            </div>
            {sale.client_first_name ? (
              <>
                <p className="text-sm font-semibold text-stone-900">{sale.client_first_name} {sale.client_last_name}</p>
                {sale.client_phone && (
                  <p className="text-xs text-stone-400 mt-0.5">{sale.client_phone}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-stone-500">{sale.client_name || 'Client passager'}</p>
            )}
          </CardContent>
        </Card>

        {/* Vendeur */}
        <Card className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <UserCheck size={16} className="text-orange-600" />
              </div>
              <span className="text-xs font-medium text-stone-500">Vendeur</span>
            </div>
            <p className="text-sm font-semibold text-stone-900">
              {sale.seller_name || 'Non renseigné'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ────────── CONTENU PRINCIPAL ────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── COL GAUCHE : Articles ── */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="bg-stone-50/50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package size={16} className="text-stone-500" />
                Articles commandés
                <Badge variant="outline" className="ml-auto text-xs">
                  {sale.items?.length || 0} article{(sale.items?.length || 0) > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 text-xs font-medium text-stone-400 uppercase tracking-wider border-b bg-stone-50/30">
                <span>Produit</span>
                <span className="text-right">P.U.</span>
                <span className="text-center">Qté</span>
                <span className="text-right">Total</span>
              </div>

              {/* Items */}
              <div className="divide-y divide-stone-100">
                {sale.items?.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 items-center hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-10 w-10 rounded-lg object-cover border border-stone-100 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-stone-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{item.product_name}</p>
                        {item.price_type !== 'retail' && (
                          <Badge variant="outline" className="text-[10px] mt-0.5 px-1.5 py-0">
                            {item.price_type === 'wholesale' ? 'Gros' : item.price_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-stone-600 text-right whitespace-nowrap">
                      {parseInt(item.unit_price).toLocaleString()} F
                    </span>
                    <span className="text-sm font-medium text-stone-700 text-center min-w-[40px]">
                      ×{item.quantity}
                    </span>
                    <span className="text-sm font-semibold text-stone-900 text-right whitespace-nowrap">
                      {parseInt(item.total_price).toLocaleString()} F
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t bg-stone-50/50 px-5 py-4 space-y-2">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Sous-total</span>
                  <span className="font-medium text-stone-700">{subtotal.toLocaleString()} F</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Percent size={12} />
                      Remise
                      {sale.discount_type === 'percentage' && (
                        <span className="text-xs text-stone-400">({sale.discount_value}%)</span>
                      )}
                    </span>
                    <span className="font-medium text-emerald-600">-{discount.toLocaleString()} F</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                  <span className="text-base font-bold text-stone-900">Total</span>
                  <span className="text-xl font-bold text-stone-900">{total.toLocaleString()} F</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {sale.notes && (
            <motion.div variants={itemVariants}>
              <Card className="border shadow-sm">
                <CardContent className="p-5">
                  <h3 className="text-sm font-medium text-stone-500 mb-2 flex items-center gap-1.5">
                    <Tag size={14} />
                    Notes
                  </h3>
                  <p className="text-sm text-stone-700 leading-relaxed">{sale.notes}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* ── COL DROITE : Résumé paiement ── */}
        <motion.div variants={itemVariants} className="space-y-6">

          {/* Card paiement */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard size={16} className="text-stone-500" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Barre de progression */}
              <div>
                <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                  <span>Progression</span>
                  <span className="font-medium">{paymentProgress}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${paymentProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    className={cn(
                      'h-full rounded-full transition-colors',
                      paymentProgress >= 100 ? 'bg-emerald-500' :
                      paymentProgress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                  />
                </div>
              </div>

              {/* Détails paiement */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Montant payé</span>
                  <span className="text-sm font-semibold text-stone-900">{paid.toLocaleString()} F</span>
                </div>
                {due > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-500">Montant dû</span>
                    <span className="text-sm font-semibold text-red-600">{due.toLocaleString()} F</span>
                  </div>
                )}
                {(paid - total) > 0 && (
                  <div className="flex justify-between items-center bg-emerald-50 rounded-lg px-3 py-2 -mx-1">
                    <span className="text-sm text-emerald-600">Monnaie rendue</span>
                    <span className="text-sm font-semibold text-emerald-700">{(paid - total).toLocaleString()} F</span>
                  </div>
                )}
              </div>

              {/* Méthode + référence */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-stone-100 flex items-center justify-center">
                    <payMethod.icon size={14} className="text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">{payMethod.label}</p>
                    {sale.payment_reference && (
                      <p className="text-xs text-stone-400">Réf : {sale.payment_reference}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Statut paiement */}
              <div className="border-t pt-3">
                <div className="flex items-center gap-2">
                  <payStatus.icon size={16} className={cn(
                    payStatus.color.includes('emerald') ? 'text-emerald-500' :
                    payStatus.color.includes('amber') ? 'text-amber-500' :
                    payStatus.color.includes('orange') ? 'text-orange-500' :
                    payStatus.color.includes('red') ? 'text-red-500' : 'text-gray-400'
                  )} />
                  <Badge className={cn('text-xs border', payStatus.color)}>
                    {payStatus.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card informations */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash size={16} className="text-stone-500" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">N° de vente</span>
                <span className="font-mono font-medium text-stone-700">{sale.sale_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Date</span>
                <span className="text-stone-700">
                  {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Heure</span>
                <span className="text-stone-700">
                  {new Date(sale.sale_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {sale.seller_name && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Vendeur</span>
                  <span className="text-stone-700">{sale.seller_name}</span>
                </div>
              )}
              {sale.discount_type && sale.discount_type !== 'none' && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Type de remise</span>
                  <span className="text-stone-700">
                    {sale.discount_type === 'percentage' ? `${sale.discount_value}%` : `${parseInt(sale.discount_value).toLocaleString()} F`}
                  </span>
                </div>
              )}
              {sale.cancel_reason && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-red-500 mb-1">Raison d&apos;annulation</p>
                  <p className="text-sm text-stone-600">{sale.cancel_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}