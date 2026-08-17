'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { warehouseApi } from '@/lib/api/warehouses';

export default function CancelTransferModal({ isOpen, onClose, movement, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!movement) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await warehouseApi.cancelTransfer(movement.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'annulation.");
    } finally {
      setLoading(false);
    }
  };

  const quantity = Math.abs(Number(movement.quantity));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Annuler le transfert
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir annuler ce transfert ?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800 text-sm space-y-2 mt-4">
          <p>
            <strong>{quantity} unités</strong> seront restituées à l'entrepôt <strong>{movement.warehouse_name || ''}</strong>.
          </p>
          <p>
            La même quantité sera déduite du stock de la boutique cible. 
            Si ce transfert avait créé la fiche produit dans la boutique, la fiche sera conservée mais son stock sera réduit.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 mt-4">
            {error}
          </div>
        )}

        <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Fermer
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Annulation...' : 'Confirmer l\'annulation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
