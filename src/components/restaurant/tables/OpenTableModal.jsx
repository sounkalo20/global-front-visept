'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Utensils, Bookmark, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function OpenTableModal({ open, onOpenChange, table, onConfirmOpen, onOpenReserve }) {
  const [guests, setGuests] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (table) {
      setGuests(table.capacity || 2);
    }
  }, [table]);

  if (!table) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await onConfirmOpen(table.id, guests);
    setIsSubmitting(false);

    if (res.success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Utensils className="text-emerald-600" size={20} />
            Ouvrir la Table {table.table_number ? table.table_number : table.table_name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Nombre de couverts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
              Nombre de couverts / personnes
            </label>

            <div className="flex items-center justify-center gap-4 bg-gray-50 p-4 rounded-2xl border">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
              >
                <Minus size={16} />
              </Button>

              <div className="text-center w-16">
                <span className="text-3xl font-extrabold text-gray-900">{guests}</span>
                <span className="block text-xs text-gray-500 font-medium">personne(s)</span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl"
                onClick={() => setGuests((g) => g + 1)}
              >
                <Plus size={16} />
              </Button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-2">
              Capacité maximale conseillée : {table.capacity} places
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-2 pt-2 border-t">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl text-base"
            >
              <Utensils size={18} className="mr-2" />
              {isSubmitting ? 'Ouverture...' : 'Prendre la commande'}
            </Button>

            {onOpenReserve && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onOpenChange(false);
                  onOpenReserve(table);
                }}
                className="w-full text-purple-700 hover:bg-purple-50"
              >
                <Bookmark size={16} className="mr-2" />
                Réserver cette table
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
