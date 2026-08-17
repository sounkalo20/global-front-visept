'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function DebtTable({
  debts,
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

  // Vérifier que debts est un tableau
  if (!debts || !Array.isArray(debts) || debts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-[#9CA3AF]">
        Aucune dette à afficher.
      </div>
    );
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
                    aria-label="Sélectionner toutes les dettes"
                    className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left">Client</th>
              {col('sale') && <th className="px-4 py-3 text-left">Vente</th>}
              <th className="px-4 py-3 text-right">Total</th>
              {col('paid') && <th className="px-4 py-3 text-right">Payé</th>}
              <th className="px-4 py-3 text-right">Reste</th>
              {col('status') && <th className="px-4 py-3 text-center">Statut</th>}
              {col('due_date') && <th className="px-4 py-3 text-left">Échéance</th>}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
            {debts.map((debt, i) => {
              const badge = statusBadge(debt.status);
              const totalPaid = parseFloat(debt.total_paid || 0);
              const selected = isSelected?.(debt.id) || false;
              return (
                <motion.tr
                  key={debt.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selected
                      ? "bg-brand-50/70 dark:bg-brand-950/40"
                      : "hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/40"
                  )}
                  onClick={() => router.push(`/shop/debts/${debt.id}`)}
                >
                  {onToggleSelect && (
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(debt.id)}
                        aria-label={`Sélectionner dette ${debt.sale_number || debt.id}`}
                        className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">{debt.client_name || 'Inconnu'}</p>
                    <p className="text-xs text-gray-400 dark:text-[#9CA3AF] flex items-center gap-1"><Phone size={10} /> {debt.client_phone || '-'}</p>
                  </td>
                  {col('sale') && <td className="px-4 py-3 text-sm text-gray-700 dark:text-[#D1D5DB]">{debt.sale_number || `#${debt.id}`}</td>}
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-[#F9FAFB]">{parseInt(debt.total_amount || 0).toLocaleString()} F</td>
                  {col('paid') && <td className="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400 font-medium">{totalPaid.toLocaleString()} F</td>}
                  <td className="px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400">{parseInt(debt.remaining_amount || 0).toLocaleString()} F</td>
                  {col('status') && (
                    <td className="px-4 py-3 text-center">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', badge.color)}>{badge.label}</span>
                    </td>
                  )}
                  {col('due_date') && (
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#9CA3AF]">
                      {debt.due_date ? new Date(debt.due_date).toLocaleDateString('fr-FR') : '-'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-[#D1D5DB] hover:bg-gray-100 dark:hover:bg-[#1F2937]" onClick={() => router.push(`/shop/debts/${debt.id}`)}>
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
        {debts.map((debt, i) => {
          const badge = statusBadge(debt.status);
          const totalPaid = parseFloat(debt.total_paid || 0);
          const progress = parseFloat(debt.total_amount) > 0 ? (totalPaid / parseFloat(debt.total_amount)) * 100 : 0;
          const selected = isSelected?.(debt.id) || false;
          return (
            <motion.div
              key={debt.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "rounded-2xl border bg-white dark:bg-[#111827] p-4 cursor-pointer shadow-xs transition-colors",
                selected
                  ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 dark:border-brand-500"
                  : "border-gray-200 dark:border-[#374151]"
              )}
              onClick={() => router.push(`/shop/debts/${debt.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {onToggleSelect && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(debt.id)}
                        aria-label={`Sélectionner dette ${debt.sale_number || debt.id}`}
                        className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer shrink-0"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-[#F9FAFB]">{debt.client_name || 'Inconnu'}</p>
                    <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">{debt.client_phone || '-'}</p>
                  </div>
                </div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', badge.color)}>{badge.label}</span>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-[#374151]">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-[#D1D5DB]">Total : {parseInt(debt.total_amount || 0).toLocaleString()} F</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">Reste : {parseInt(debt.remaining_amount || 0).toLocaleString()} F</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-[#374151] rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}