'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useSaleStore from '@/store/saleStore';
import useCompanyStore from '@/store/companyStore';

export default function CancelSaleDialog({ sale, open, onOpenChange, onSuccess }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cancelSale } = useSaleStore();
  const { activeCompany } = useCompanyStore();

  const handleCancel = async () => {
    setIsSubmitting(true);
    const result = await cancelSale(sale.id, activeCompany.id, reason);
    setIsSubmitting(false);
    if (result.success) {
      toast.success('Vente annulée. Stock restauré.');
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
            <DialogTitle>Annuler la vente</DialogTitle>
          </div>
          <DialogDescription>
            Voulez-vous vraiment annuler la vente <strong>{sale?.sale_number}</strong> ? Le stock sera automatiquement restauré.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <label className="text-sm font-medium">Raison (optionnelle)</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Raison de l'annulation..."
            className="w-full mt-1 h-10 rounded-lg border px-3 text-sm"
          />
        </div>
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