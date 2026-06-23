'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, User, CreditCard, AlertCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const statusBadge = (status) => {
  const map = {
    paid: { label: 'Payé', color: 'bg-green-100 text-green-700' },
    partial: { label: 'Partiel', color: 'bg-amber-100 text-amber-700' },
    debt: { label: 'Dette', color: 'bg-orange-100 text-orange-700' },
    unpaid: { label: 'Impayé', color: 'bg-red-100 text-red-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100' };
};

export default function SaleDetail({ sale, onBack, onCancel, editLink }) {
  if (!sale) return null;
  const payStatus = statusBadge(sale.payment_status);
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft size={18} /></Button>
          <div>
            <h1 className="text-xl font-bold">{sale.sale_number}</h1>
            <p className="text-sm text-gray-500">{new Date(sale.sale_date).toLocaleString('fr-FR')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {sale.status !== 'canceled' && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(editLink + `/${sale.id}/edit`)}
              >
                <Edit size={16} className="mr-2" /> Modifier
              </Button>
              <Button
                variant="outline"
                onClick={() => onCancel(sale)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <AlertCircle size={16} className="mr-2" /> Annuler
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Infos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Client */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-medium mb-3 flex items-center gap-2"><User size={16} /> Client</h3>
            {sale.client_first_name ? (
              <div>
                <p className="font-medium">{sale.client_first_name} {sale.client_last_name}</p>
                <p className="text-sm text-gray-500">{sale.client_phone}</p>
              </div>
            ) : (
              <p className="text-gray-500">{sale.client_name || 'Client passager'}</p>
            )}
          </div>

          {/* Produits */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-medium mb-3">Articles</h3>
            <div className="space-y-2">
              {sale.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {item.product_image && <img src={item.product_image} className="h-10 w-10 rounded object-cover" />}
                    <div>
                      <p className="font-medium text-sm">{item.product_name}</p>
                      <p className="text-xs text-gray-400">
                        {item.quantity} x {parseInt(item.unit_price).toLocaleString()} F
                        {item.price_type !== 'retail' && (
                          <span className="ml-1 text-brand-600">({item.price_type})</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">{parseInt(item.total_price).toLocaleString()} F</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="rounded-xl border bg-white p-5 h-fit space-y-4">
          <h3 className="font-medium flex items-center gap-2"><CreditCard size={16} /> Résumé</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{parseInt(sale.subtotal).toLocaleString()} F</span>
            </div>
            {sale.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Remise</span>
                <span>-{parseInt(sale.discount_amount).toLocaleString()} F</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{parseInt(sale.total_amount).toLocaleString()} F</span>
            </div>
          </div>
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', payStatus.color)}>
                {payStatus.label}
              </span>
            </div>
            <p className="text-sm">Payé : {parseInt(sale.amount_paid).toLocaleString()} F</p>
            {sale.amount_due > 0 && (
              <p className="text-sm text-red-500">Dû : {parseInt(sale.amount_due).toLocaleString()} F</p>
            )}
            <p className="text-sm text-gray-500 capitalize">{sale.payment_method?.replace('_', ' ')}</p>
            {sale.payment_reference && (
              <p className="text-sm text-gray-400">Réf : {sale.payment_reference}</p>
            )}
            {sale.seller_name && (
              <p className="text-sm text-gray-400">Vendeur : {sale.seller_name}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}