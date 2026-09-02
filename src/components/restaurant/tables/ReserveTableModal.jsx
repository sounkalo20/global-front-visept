'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bookmark, Clock, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ReserveTableModal({ open, onOpenChange, table, onConfirmReserve }) {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!table) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await onConfirmReserve(table.id, 'reserved', { clientName, phone, reservationTime });
    setIsSubmitting(false);

    if (res.success) {
      toast.success(`Table ${table.table_number || table.table_name} marquée comme réservée.`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-purple-700">
            <Bookmark size={20} />
            Réserver la Table {table.table_number ? table.table_number : table.table_name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Ex: M. Soumano"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="70 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure prévue</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  type="time"
                  className="pl-9"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
              {isSubmitting ? 'Enregistrement...' : 'Confirmer la réservation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
