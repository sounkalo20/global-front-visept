'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useExpenseStore from '@/store/expenseStore';
import useCompanyStore from '@/store/companyStore';

const expenseSchema = z.object({
  title: z.string().min(2, 'Min. 2 caractères').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  category: z.enum(['rent','salary','utility','transport','maintenance','inventory','tax','marketing','equipment','internet','mobile_money_fee','bank_fee','restaurant_supply','salon_supply','other']),
  amount: z.coerce.number().positive('Montant > 0'),
  payment_method: z.enum(['cash','mobile_money','bank_transfer','check','other']),
  payment_reference: z.string().max(100).optional().or(z.literal('')),
  expense_date: z.string().min(1, 'Date requise'),
});

export default function ExpenseModal({ open, onOpenChange, expense, onSuccess, categories }) {
  const { createExpense, updateExpense } = useExpenseStore();
  const { activeCompany } = useCompanyStore();
  const isEditing = !!expense;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: 'other', payment_method: 'cash', expense_date: new Date().toISOString().split('T')[0] },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: expense?.title || '',
        description: expense?.description || '',
        category: expense?.category || 'other',
        amount: expense?.amount || '',
        payment_method: expense?.payment_method || 'cash',
        payment_reference: expense?.payment_reference || '',
        expense_date: expense?.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [expense, open, reset]);

  const onSubmit = async (data) => {
    if (!activeCompany) return;
    const payload = { company_id: activeCompany.id, ...data };
    const result = isEditing ? await updateExpense(expense.id, payload) : await createExpense(payload);
    if (result.success) {
      toast.success(isEditing ? 'Dépense modifiée.' : 'Dépense créée.');
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier la dépense' : 'Nouvelle dépense'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Modifiez les informations.' : 'Enregistrez une nouvelle dépense.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium">Titre *</label>
            <Input placeholder="Ex: Facture électricité" error={errors.title?.message} {...register('title')} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Catégorie *</label>
              <select {...register('category')} className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm">
                {(categories || []).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Montant *</label>
              <Input type="number" step="0.01" placeholder="0" error={errors.amount?.message} {...register('amount')} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="Description (optionnelle)" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Méthode de paiement</label>
              <select {...register('payment_method')} className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm">
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Virement</option>
                <option value="check">Chèque</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input type="date" error={errors.expense_date?.message} {...register('expense_date')} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Référence</label>
            <Input placeholder="N° transaction (optionnel)" {...register('payment_reference')} />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {isEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}