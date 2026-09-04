'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, Phone, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DebtReceiptPreviewModal from '@/components/debts/receipt/DebtReceiptPreviewModal';

const statusBadge = (status) => {
  const map = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
    partial: { label: 'Partiel', color: 'bg-amber-100 text-amber-700' },
    paid: { label: 'Payé', color: 'bg-green-100 text-green-700' },
    overdue: { label: 'En retard', color: 'bg-red-100 text-red-700' },
    canceled: { label: 'Annulé', color: 'bg-gray-100 text-gray-500' },
  };
  return map[status] || { label: status || 'Inconnu', color: 'bg-gray-100 text-gray-600' };
};

export default function DebtTable({ debts }) {
  const router = useRouter();
  const [selectedDebtForPrint, setSelectedDebtForPrint] = useState(null);

  if (!debts || !Array.isArray(debts) || debts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        Aucune dette à afficher.
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-xl border bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Vente</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Payé</th>
              <th className="px-4 py-3 text-right">Reste</th>
              <th className="px-4 py-3 text-center">Statut</th>
              <th className="px-4 py-3 text-left">Échéance</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {debts.map((debt, i) => {
              const badge = statusBadge(debt.status);
              const totalPaid = parseFloat(debt.total_paid || 0);
              const totalAmount = parseInt(debt.total_amount || 0);
              const discAmt = parseFloat(debt.sale_discount_amount || debt.discount_amount || 0);
              const discType = debt.sale_discount_type || debt.discount_type || 'none';
              const discVal = debt.sale_discount_value || debt.discount_value || 0;
              const subtotal = parseInt(debt.sale_subtotal || debt.subtotal || totalAmount + discAmt);
              const remaining = parseInt(debt.remaining_amount || 0);
              const progress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

              return (
                <motion.tr
                  key={debt.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/shop/debts/${debt.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{debt.client_name || 'Inconnu'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} /> {debt.client_phone || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{debt.sale_number || `#${debt.id}`}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-base text-gray-900">{subtotal.toLocaleString()} F</div>
                    {discAmt > 0 && (
                      <span className="inline-block text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                        🏷️ Remise: -{discType === 'percentage' ? `${discVal}%` : `${discAmt.toLocaleString()} F`}
                      </span>
                    )}
                    <div className="text-xs font-bold text-red-600 mt-0.5">
                      Dette: {remaining.toLocaleString()} F
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-green-600 font-medium">{totalPaid.toLocaleString()} F</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{remaining.toLocaleString()} F</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', badge.color)}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {debt.due_date ? new Date(debt.due_date).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/shop/debts/${debt.id}`)}>
                        <Eye size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600 hover:text-brand-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDebtForPrint(debt);
                        }}
                      >
                        <Printer size={15} />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {debts.map((debt, i) => {
          const badge = statusBadge(debt.status);
          const totalPaid = parseFloat(debt.total_paid || 0);
          const totalAmount = parseInt(debt.total_amount || 0);
          const discAmt = parseFloat(debt.sale_discount_amount || debt.discount_amount || 0);
          const discType = debt.sale_discount_type || debt.discount_type || 'none';
          const discVal = debt.sale_discount_value || debt.discount_value || 0;
          const subtotal = parseInt(debt.sale_subtotal || debt.subtotal || totalAmount + discAmt);
          const remaining = parseInt(debt.remaining_amount || 0);
          const progress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
          return (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="rounded-xl border bg-white p-4 cursor-pointer"
              onClick={() => router.push(`/shop/debts/${debt.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{debt.client_name || 'Inconnu'}</p>
                  <p className="text-xs text-gray-500">{debt.client_phone || '-'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', badge.color)}>{badge.label}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDebtForPrint(debt);
                    }}
                  >
                    <Printer size={14} />
                  </Button>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-base text-gray-900">Total : {subtotal.toLocaleString()} F</span>
                  {discAmt > 0 && (
                    <span className="inline-block text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      🏷️ -{discType === 'percentage' ? `${discVal}%` : `${discAmt.toLocaleString()} F`}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-red-600">
                  Dette / Reste : {remaining.toLocaleString()} F
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal impression du reçu de dette */}
      <DebtReceiptPreviewModal
        debt={selectedDebtForPrint}
        open={!!selectedDebtForPrint}
        onOpenChange={(open) => {
          if (!open) setSelectedDebtForPrint(null);
        }}
      />
    </>
  );
}