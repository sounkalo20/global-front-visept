'use client';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categoryBadge = (cat) => {
    const map = {
        rent: { label: 'Loyer', color: 'bg-purple-100 text-purple-700' },
        salary: { label: 'Salaire', color: 'bg-blue-100 text-blue-700' },
        utility: { label: 'Énergie', color: 'bg-yellow-100 text-yellow-700' },
        transport: { label: 'Transport', color: 'bg-green-100 text-green-700' },
        maintenance: { label: 'Maintenance', color: 'bg-cyan-100 text-cyan-700' },
        inventory: { label: 'Stock', color: 'bg-orange-100 text-orange-700' },
        tax: { label: 'Taxes', color: 'bg-red-100 text-red-700' },
        marketing: { label: 'Marketing', color: 'bg-pink-100 text-pink-700' },
        equipment: { label: 'Équipement', color: 'bg-indigo-100 text-indigo-700' },
        internet: { label: 'Internet', color: 'bg-teal-100 text-teal-700' },
        other: { label: 'Autre', color: 'bg-gray-100 text-gray-600' },
    };
    return map[cat] || { label: cat, color: 'bg-gray-100 text-gray-600' };
};

const paymentIcon = (method) => {
    const map = {
        cash: '💵',
        mobile_money: '📱',
        bank_transfer: '🏦',
        check: '📝',
        other: '💳',
    };
    return map[method] || '💳';
};

export default function ExpenseTable({
    expenses,
    onView,
    onEdit,
    onDelete,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    isAllPageSelected,
    isSomePageSelected,
    isSelected,
    visibleColumns,
}) {
    const col = (id) => !visibleColumns || visibleColumns.has(id);
    if (!expenses || expenses.length === 0) {
        return <p className="text-center text-gray-400 dark:text-[#9CA3AF] py-12">Aucune dépense trouvée.</p>;
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
                                        aria-label="Sélectionner toutes les dépenses"
                                        className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                    />
                                </th>
                            )}
                            <th className="px-4 py-3 text-left">Dépense</th>
                            {col('category') && <th className="px-4 py-3 text-center">Catégorie</th>}
                            <th className="px-4 py-3 text-right">Montant</th>
                            {col('payment') && <th className="px-4 py-3 text-center">Paiement</th>}
                            {col('date') && <th className="px-4 py-3 text-left">Date</th>}
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
                        {expenses.map((expense, i) => {
                            const badge = categoryBadge(expense.category);
                            const selected = isSelected?.(expense.id) || false;
                            return (
                                <motion.tr
                                    key={expense.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={cn(
                                        "cursor-pointer transition-colors",
                                        selected
                                            ? "bg-brand-50/70 dark:bg-brand-950/40"
                                            : "hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/40"
                                    )}
                                    onClick={() => onView(expense)}
                                >
                                    {onToggleSelect && (
                                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => onToggleSelect(expense.id)}
                                                aria-label={`Sélectionner ${expense.title}`}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB]">{expense.title}</p>
                                        {expense.description && (
                                            <p className="text-xs text-gray-400 dark:text-[#9CA3AF] truncate max-w-[250px]">{expense.description}</p>
                                        )}
                                    </td>
                                    {col('category') && (
                                        <td className="px-4 py-3 text-center">
                                            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', badge.color)}>{badge.label}</span>
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-right">
                                        <span className="font-semibold text-red-600 dark:text-red-400">{parseInt(expense.amount).toLocaleString()} FCFA</span>
                                    </td>
                                    {col('payment') && (
                                        <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-[#D1D5DB]">
                                            <span title={expense.payment_method}>{paymentIcon(expense.payment_method)} {expense.payment_method?.replace('_', ' ')}</span>
                                        </td>
                                    )}
                                    {col('date') && (
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-[#9CA3AF]">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(expense.expense_date).toLocaleDateString('fr-FR')}</span>
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-[#D1D5DB] hover:bg-gray-100 dark:hover:bg-[#1F2937]" onClick={() => onView(expense)}><Eye size={15} /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-[#D1D5DB] hover:bg-gray-100 dark:hover:bg-[#1F2937]" onClick={() => onEdit(expense)}><Edit size={15} /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => onDelete(expense)}><Trash2 size={15} /></Button>
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
                {expenses.map((expense, i) => {
                    const badge = categoryBadge(expense.category);
                    const selected = isSelected?.(expense.id) || false;
                    return (
                        <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={cn(
                                "rounded-2xl border bg-white dark:bg-[#111827] p-4 cursor-pointer shadow-xs transition-colors",
                                selected
                                    ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 dark:border-brand-500"
                                    : "border-gray-200 dark:border-[#374151]"
                            )}
                            onClick={() => onView(expense)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {onToggleSelect && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => onToggleSelect(expense.id)}
                                                aria-label={`Sélectionner ${expense.title}`}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer shrink-0"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-[#F9FAFB]">{expense.title}</p>
                                        <span className={cn('rounded-full px-2 py-0.5 text-xs mt-1 inline-block font-semibold', badge.color)}>{badge.label}</span>
                                    </div>
                                </div>
                                <p className="font-bold text-red-600 dark:text-red-400">{parseInt(expense.amount).toLocaleString()} F</p>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-[#374151] text-xs text-gray-500 dark:text-[#9CA3AF]">
                                <span>{new Date(expense.expense_date).toLocaleDateString('fr-FR')}</span>
                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 dark:text-[#D1D5DB]" onClick={() => onEdit(expense)}><Edit size={14} /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 dark:text-red-400" onClick={() => onDelete(expense)}><Trash2 size={14} /></Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </>
    );
}