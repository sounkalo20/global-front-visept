'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useDebtStore from '@/store/debtStore';
import useCompanyStore from '@/store/companyStore';

export default function CancelDebtDialog({ debt, open, onOpenChange, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cancelDebt } = useDebtStore();
  const { activeCompany } = useCompanyStore();

  const handleCancel = async () => {
    setIsSubmitting(true);
    const result = await cancelDebt(debt.id, activeCompany.id);
    setIsSubmitting(false);
    if (result.success) {
      toast.success('Dette annulée.');
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-red-100 p-2"><AlertTriangle size={20} className="text-red-600" /></div>
            <DialogTitle>Annuler la dette</DialogTitle>
          </div>
          <DialogDescription>
            Voulez-vous vraiment annuler cette dette de <strong>{debt?.client_name}</strong> ?<br />
            Montant restant : <strong className="text-red-600">{parseInt(debt?.remaining_amount || 0).toLocaleString()} FCFA</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Annuler</Button>
          <Button onClick={handleCancel} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
            {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Confirmer l'annulation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}