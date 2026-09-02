'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, MoveRight, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function TransferTableModal({ open, onOpenChange, table, availableTables = [], onConfirmTransfer }) {
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!table) return null;

  const handleTransfer = async () => {
    if (!selectedTargetId) {
      toast.error('Veuillez sélectionner la table de destination.');
      return;
    }

    setIsSubmitting(true);
    const res = await onConfirmTransfer(table.session_id, selectedTargetId);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message || 'Table transférée avec succès !');
      onOpenChange(false);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-blue-700">
            <MoveRight size={20} />
            Transférer la Table {table.table_number ? table.table_number : table.table_name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 space-y-4">
          <p className="text-sm text-gray-600">
            Sélectionnez la table libre vers laquelle déplacer la commande actuelle ({table.items_count || 0} article(s) • {Number(table.total_amount || 0).toLocaleString()} FCFA).
          </p>

          {availableTables.length === 0 ? (
            <div className="p-6 bg-gray-50 border rounded-2xl text-center text-sm text-gray-500">
              Aucune autre table libre disponible pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-1">
              {availableTables.map((target) => {
                const isSelected = selectedTargetId === target.id;
                return (
                  <div
                    key={target.id}
                    onClick={() => setSelectedTargetId(target.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-center flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/40 shadow-sm font-semibold'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                    }`}
                  >
                    <span className="font-bold text-sm">
                      {target.table_number ? `Table ${target.table_number}` : target.table_name}
                    </span>
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                      <Users size={12} />
                      <span>{target.capacity} places</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isSubmitting || !selectedTargetId}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {isSubmitting ? 'Transfert en cours...' : 'Valider le transfert'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
