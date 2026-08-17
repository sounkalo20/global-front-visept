'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const statusBadge = (status) => {
  const map = {
    paid: { label: 'Payé', color: 'bg-green-100 text-green-700' },
    partial: { label: 'Partiel', color: 'bg-amber-100 text-amber-700' },
    unpaid: { label: 'Impayé', color: 'bg-red-100 text-red-700' },
    debt: { label: 'Dette', color: 'bg-orange-100 text-orange-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100' };
};

const saleStatusBadge = (status) => {
  const map = {
    completed: { label: 'Complété', color: 'bg-green-100 text-green-700' },
    canceled: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
    refunded: { label: 'Remboursé', color: 'bg-purple-100 text-purple-700' },
  };
  return map[status] || { label: status, color: 'bg-gray-100' };
};

export default function SalesTable({
  sales,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  isAllPageSelected,
  isSomePageSelected,
  isSelected,
  visibleColumns,
}) {
  const router = useRouter();
  const col = (id) => !visibleColumns || visibleColumns.has(id);

  if (!sales || sales.length === 0) {
    return <p className="text-center text-gray-400 dark:text-[#9CA3AF] py-12">Aucune vente trouvée.</p>;
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-2xl border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-[#374151] bg-gray-50/80 dark:bg-[#1F2937]/80 text-xs font-semibold text-gray-500 dark:text-[#D1D5DB] uppercase">
              {onToggleSelect && (
                <th className="px-4 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected || false}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomePageSelected || false;
                    }}
                    onChange={onToggleSelectAll}
                    aria-label="Sélectionner toutes les ventes"
                    className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left">N° Vente</th>
              {col('client') && <th className="px-4 py-3 text-left">Client</th>}
              {col('items') && <th className="px-4 py-3 text-right">Articles</th>}
              <th className="px-4 py-3 text-right">Montant</th>
              {col('payment') && <th className="px-4 py-3 text-center">Paiement</th>}
              {col('status') && <th className="px-4 py-3 text-center">Statut</th>}
              {col('seller') && <th className="px-4 py-3 text-left">Vendeur</th>}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
            {sales.map((sale, i) => {
              const payStatus = statusBadge(sale.payment_status);
              const orderStatus = saleStatusBadge(sale.status);
              const selected = isSelected?.(sale.id) || false;
              return (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selected
                      ? "bg-brand-50/70 dark:bg-brand-950/40"
                      : "hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/40"
                  )}
                  onClick={() => router.push(`/shop/sales/${sale.id}`)}
                >
                  {onToggleSelect && (
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(sale.id)}
                        aria-label={`Sélectionner vente ${sale.sale_number}`}
                        className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">{sale.sale_number}</p>
                      {sale.returned_amount > 0 && (
                        <span className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-red-100 dark:border-red-800/40" title={`Retour de ${parseInt(sale.returned_amount).toLocaleString()} F`}>
                          <RotateCcw size={10} />
                          -{parseInt(sale.returned_amount).toLocaleString()} F
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-[#9CA3AF] mt-0.5">{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</p>
                  </td>
                  {col('client') && (
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-[#D1D5DB]">
                      {sale.client_first_name ? `${sale.client_first_name} ${sale.client_last_name}` : sale.client_name || 'Client passager'}
                    </td>
                  )}
                  {col('items') && <td className="px-4 py-3 text-right text-sm text-gray-700 dark:text-[#D1D5DB]">{sale.items_count || '-'}</td>}
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-[#F9FAFB]">{parseInt(sale.total_amount).toLocaleString()} F</td>
                  {col('payment') && (
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', payStatus.color)}>{payStatus.label}</span>
                    </td>
                  )}
                  {col('status') && (
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', orderStatus.color)}>{orderStatus.label}</span>
                    </td>
                  )}
                  {col('seller') && <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#9CA3AF]">{sale.seller_name || '-'}</td>}
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/shop/sales/${sale.id}`)} className="h-8 w-8 dark:text-[#D1D5DB] hover:bg-gray-100 dark:hover:bg-[#1F2937]">
                      <Eye size={15} />
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {sales.map((sale, i) => {
          const payStatus = statusBadge(sale.payment_status);
          const selected = isSelected?.(sale.id) || false;
          return (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "rounded-2xl border bg-white dark:bg-[#111827] p-4 cursor-pointer shadow-xs transition-colors",
                selected
                  ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 dark:border-brand-500"
                  : "border-gray-200 dark:border-[#374151]"
              )}
              onClick={() => router.push(`/shop/sales/${sale.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {onToggleSelect && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(sale.id)}
                        aria-label={`Sélectionner vente ${sale.sale_number}`}
                        className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer shrink-0"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-[#F9FAFB]">{sale.sale_number}</p>
                      {sale.returned_amount > 0 && (
                        <span className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-red-100 dark:border-red-800/40">
                          <RotateCcw size={10} />
                          -{parseInt(sale.returned_amount).toLocaleString()} F
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-[#9CA3AF] mt-0.5">
                      {sale.client_first_name ? `${sale.client_first_name} ${sale.client_last_name}` : sale.client_name || 'Client passager'}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-gray-900 dark:text-[#F9FAFB]">{parseInt(sale.total_amount).toLocaleString()} F</p>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-[#374151] text-xs">
                <span className={cn('rounded-full px-2 py-0.5 font-semibold', payStatus.color)}>{payStatus.label}</span>
                <span className="text-gray-400 dark:text-[#9CA3AF]">{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}