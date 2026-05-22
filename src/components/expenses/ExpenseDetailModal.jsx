'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, CreditCard, User, Tag, FileText, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryBadge = (cat) => {
  const map = {
    rent: { label: 'Loyer', color: 'bg-purple-100 text-purple-700' },
    salary: { label: 'Salaire', color: 'bg-blue-100 text-blue-700' },
    utility: { label: 'Énergie', color: 'bg-yellow-100 text-yellow-700' },
    transport: { label: 'Transport', color: 'bg-green-100 text-green-700' },
    inventory: { label: 'Stock', color: 'bg-orange-100 text-orange-700' },
    tax: { label: 'Taxes', color: 'bg-red-100 text-red-700' },
    other: { label: 'Autre', color: 'bg-gray-100 text-gray-600' },
  };
  return map[cat] || { label: cat, color: 'bg-gray-100' };
};

export default function ExpenseDetailModal({ expense, open, onOpenChange }) {
  if (!expense) return null;
  const badge = categoryBadge(expense.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{expense.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="text-center py-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-500">Montant</p>
            <p className="text-3xl font-bold text-red-600">{parseInt(expense.amount).toLocaleString()} FCFA</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Tag size={14} className="text-gray-400" />
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', badge.color)}>{badge.label}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-gray-400" />
              <span>{new Date(expense.expense_date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard size={14} className="text-gray-400" />
              <span className="capitalize">{expense.payment_method?.replace('_', ' ')}</span>
            </div>
            {expense.payment_reference && (
              <div className="flex items-center gap-2 text-sm">
                <Hash size={14} className="text-gray-400" />
                <span>{expense.payment_reference}</span>
              </div>
            )}
          </div>

          {expense.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{expense.description}</p>
            </div>
          )}

          {expense.notes && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{expense.notes}</p>
            </div>
          )}

          <div className="text-xs text-gray-400 flex items-center gap-1 pt-2 border-t">
            <User size={12} />
            Créée par {expense.created_by_name || '-'} {expense.created_by_lastname || ''} le {new Date(expense.created_at).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}