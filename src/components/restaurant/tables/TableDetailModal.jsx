'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG } from './TableGridCard';
import {
  Utensils,
  Receipt,
  Sparkles,
  MoveRight,
  GitMerge,
  Clock,
  Users,
  CheckCircle2,
  DollarSign,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TableDetailModal({
  open,
  onOpenChange,
  table,
  onOpenPos,
  onUpdateStatus,
  onOpenTransfer,
  onOpenMerge,
  onOpenReserve,
}) {
  if (!table) return null;

  const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
  const Icon = config.icon;
  const isOccupiedOrBill = table.status === 'occupied' || table.status === 'bill_requested';
  const totalAmount = Number(table.total_amount || 0);

  const handleClean = async () => {
    const res = await onUpdateStatus(table.id, 'available');
    if (res.success) {
      toast.success('Table nettoyée et marquée comme libre.');
      onOpenChange(false);
    } else {
      toast.error(res.message);
    }
  };

  const handleRequestBill = async () => {
    const res = await onUpdateStatus(table.id, 'bill_requested');
    if (res.success) {
      toast.success('Addition demandée — Table en attente d\'encaissement.');
      onOpenChange(false);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-full max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Header avec couleur de statut */}
        <div className={`p-5 flex items-center justify-between text-white ${config.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {table.table_number ? `Table ${table.table_number}` : table.table_name}
              </h2>
              <div className="flex items-center gap-2 text-xs opacity-90 mt-0.5">
                {table.space_name && <span>{table.space_name} • </span>}
                <span className="flex items-center gap-1">
                  <Users size={12} /> {table.number_of_guests || table.capacity} pers.
                </span>
                {table.duration_minutes !== undefined && (
                  <span className="flex items-center gap-1 ml-2">
                    <Clock size={12} /> {table.duration_minutes} min
                  </span>
                )}
              </div>
            </div>
          </div>

          <Badge className={`text-xs px-3 py-1 font-semibold ${config.badgeBg}`}>
            {config.label}
          </Badge>
        </div>

        {/* Corps : Résumé de la commande active */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isOccupiedOrBill ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <Utensils size={16} className="text-brand-600" />
                  Commande en cours ({table.items_count || 0} article(s))
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  N° {table.sale_number || '-'}
                </span>
              </div>

              {table.items && table.items.length > 0 ? (
                <div className="border rounded-xl divide-y bg-gray-50/50 max-h-56 overflow-y-auto">
                  {table.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.quantity}× {item.product_name}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-400 italic">Note : {item.notes}</p>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">
                        {Number(item.total_price || 0).toLocaleString()} FCFA
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-400 border border-dashed rounded-xl">
                  Aucun plat ajouté pour le moment dans la commande.
                </div>
              )}

              {/* Total commande */}
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-900">Montant Total Addition</span>
                <span className="text-xl font-extrabold text-emerald-700">
                  {totalAmount.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          ) : table.status === 'needs_cleaning' ? (
            <div className="p-6 text-center space-y-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <Sparkles size={36} className="mx-auto text-slate-400" />
              <div>
                <h4 className="font-bold text-gray-800">Table à débarrasser / nettoyer</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Les clients ont quitté la table. Une fois le nettoyage effectué, marquez-la comme libre.
                </p>
              </div>
            </div>
          ) : table.status === 'reserved' ? (
            <div className="p-6 text-center space-y-3 bg-purple-50 border border-purple-200 rounded-2xl">
              <Bookmark size={36} className="mx-auto text-purple-600" />
              <div>
                <h4 className="font-bold text-purple-900">Table Réservée</h4>
                <p className="text-xs text-purple-700 mt-1">
                  Cette table a été réservée. Cliquez sur "Prendre la commande" lors de l'arrivée des clients.
                </p>
              </div>
            </div>
          ) : null}

          {/* Grille d'actions rapides */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Actions disponibles</h4>

            <div className="grid grid-cols-2 gap-2">
              {/* Pos / Compléter */}
              {isOccupiedOrBill && (
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onOpenPos(table);
                  }}
                  className="bg-brand-600 hover:bg-brand-700 text-white justify-start font-semibold"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Gérer la commande (POS)
                </Button>
              )}

              {/* Demander l'addition */}
              {table.status === 'occupied' && (
                <Button
                  onClick={handleRequestBill}
                  variant="outline"
                  className="border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100 justify-start font-semibold"
                >
                  <Receipt size={16} className="mr-2 text-amber-600" />
                  Demander l'addition
                </Button>
              )}

              {/* Transférer */}
              {isOccupiedOrBill && onOpenTransfer && (
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onOpenTransfer(table);
                  }}
                  variant="outline"
                  className="justify-start font-medium text-gray-700"
                >
                  <MoveRight size={16} className="mr-2 text-blue-600" />
                  Transférer la table
                </Button>
              )}

              {/* Fusionner */}
              {isOccupiedOrBill && onOpenMerge && (
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    onOpenMerge(table);
                  }}
                  variant="outline"
                  className="justify-start font-medium text-gray-700"
                >
                  <GitMerge size={16} className="mr-2 text-purple-600" />
                  Fusionner des tables
                </Button>
              )}

              {/* Marquer comme propre */}
              {(table.status === 'needs_cleaning' || table.status === 'bill_requested') && (
                <Button
                  onClick={handleClean}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white justify-start font-semibold col-span-2"
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  Marquer la table comme propre & libre
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
