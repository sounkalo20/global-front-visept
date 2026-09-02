'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GitMerge, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function MergeTableModal({ open, onOpenChange, primaryTable, occupiedTables = [], onConfirmMerge }) {
  const [selectedSecondaryId, setSelectedSecondaryId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!primaryTable) return null;

  // Filtrer les tables occupées autres que la table principale
  const otherOccupiedTables = occupiedTables.filter((t) => t.id !== primaryTable.id && (t.status === 'occupied' || t.status === 'bill_requested'));

  const handleMerge = async () => {
    if (!selectedSecondaryId) {
      toast.error('Veuillez sélectionner la table à fusionner.');
      return;
    }

    setIsSubmitting(true);
    const res = await onConfirmMerge(primaryTable.id, selectedSecondaryId);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message || 'Tables fusionnées avec succès !');
      onOpenChange(false);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-purple-700">
            <GitMerge size={20} />
            Fusionner avec la Table {primaryTable.table_number ? primaryTable.table_number : primaryTable.table_name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
            <AlertTriangle size={20} className="shrink-0 text-purple-600" />
            <span>
              Les articles de la table sélectionnée seront regroupés sur l'addition de la <strong>Table {primaryTable.table_number || primaryTable.table_name}</strong>.
            </span>
          </div>

          <p className="text-sm font-medium text-gray-700">Sélectionnez la table secondaire à fusionner :</p>

          {otherOccupiedTables.length === 0 ? (
            <div className="p-6 bg-gray-50 border rounded-2xl text-center text-sm text-gray-500">
              Aucune autre table occupée disponible pour la fusion.
            </div>
          ) : (
            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              {otherOccupiedTables.map((target) => {
                const isSelected = selectedSecondaryId === target.id;
                const total = Number(target.total_amount || 0);

                return (
                  <div
                    key={target.id}
                    onClick={() => setSelectedSecondaryId(target.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-500/40 font-medium'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm">
                        {target.table_number ? `Table ${target.table_number}` : target.table_name}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {target.items_count || 0} article(s) • Serveur : {target.staff_name || 'Inconnu'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{total.toLocaleString()} FCFA</span>
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
            onClick={handleMerge}
            disabled={isSubmitting || !selectedSecondaryId}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
          >
            {isSubmitting ? 'Fusion en cours...' : 'Valider la fusion'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
