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

export default function ExpenseTable({ expenses, onView, onEdit, onDelete }) {
    if (!expenses || expenses.length === 0) {
        return <p className="text-center text-gray-400 py-12">Aucune dépense trouvée.</p>;
    }

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block rounded-xl border bg-white overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                            <th className="px-4 py-3 text-left">Dépense</th>
                            <th className="px-4 py-3 text-center">Catégorie</th>
                            <th className="px-4 py-3 text-right">Montant</th>
                            <th className="px-4 py-3 text-center">Paiement</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {expenses.map((expense, i) => {
                            const badge = categoryBadge(expense.category);
                            return (
                                <motion.tr
                                    key={expense.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onView(expense)}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-sm">{expense.title}</p>
                                        {expense.description && (
                                            <p className="text-xs text-gray-400 truncate max-w-[250px]">{expense.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', badge.color)}>{badge.label}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="font-semibold text-red-600">{parseInt(expense.amount).toLocaleString()} FCFA</span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm">
                                        <span title={expense.payment_method}>{paymentIcon(expense.payment_method)} {expense.payment_method?.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(expense.expense_date).toLocaleDateString('fr-FR')}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(expense)}><Eye size={15} /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(expense)}><Edit size={15} /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(expense)}><Trash2 size={15} /></Button>
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
                    return (
                        <motion.div
                            key={expense.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="rounded-xl border bg-white p-4 cursor-pointer"
                            onClick={() => onView(expense)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{expense.title}</p>
                                    <span className={cn('rounded-full px-2 py-0.5 text-xs mt-1 inline-block', badge.color)}>{badge.label}</span>
                                </div>
                                <p className="font-semibold text-red-600">{parseInt(expense.amount).toLocaleString()} F</p>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                <span>{new Date(expense.expense_date).toLocaleDateString('fr-FR')}</span>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(expense); }}><Edit size={14} /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); onDelete(expense); }}><Trash2 size={14} /></Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </>
    );
}