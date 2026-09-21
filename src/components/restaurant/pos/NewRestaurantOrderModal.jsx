'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Utensils,
  ShoppingBag,
  Bike,
  Zap,
  Users,
  Check,
  ChevronRight,
  MapPin,
  Phone,
  User,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import useRestaurantTableStore from '@/store/restaurantTableStore';
import useRestaurantCartStore from '@/store/restaurantCartStore';
import useCompanyStore from '@/store/companyStore';

export default function NewRestaurantOrderModal({ open, onOpenChange }) {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { spaces, tables, fetchSpaces, fetchTables, openSession } = useRestaurantTableStore();
  const cart = useRestaurantCartStore();

  const [orderType, setOrderType] = useState('dine_in'); // 'dine_in' | 'takeaway' | 'delivery' | 'counter'
  const [selectedSpaceId, setSelectedSpaceId] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && activeCompany) {
      fetchSpaces();
      fetchTables();
      setOrderType('dine_in');
      setSelectedTable(null);
      setClientName('');
      setClientPhone('');
      setDeliveryAddress('');
    }
  }, [open, activeCompany]);

  const availableTables = tables.filter((t) => {
    const spaceMatch = !selectedSpaceId || t.space_id === selectedSpaceId;
    return spaceMatch && t.status === 'available';
  });

  const handleStartOrder = async () => {
    if (orderType === 'dine_in') {
      if (!selectedTable) {
        toast.error('Veuillez choisir une table libre pour la vente Sur place.');
        return;
      }
      setLoading(true);
      const res = await openSession(selectedTable.id, numberOfGuests);
      setLoading(false);

      if (res.success) {
        cart.clearCart();
        cart.setOrderType('dine_in');
        cart.setTableSession({
          tableId: selectedTable.id,
          tableSessionId: res.data?.session_id,
          tableName: selectedTable.table_number || selectedTable.table_name,
          numberOfGuests,
        });
        toast.success(`Session ouverte sur la Table ${selectedTable.table_number || selectedTable.table_name} !`);
        onOpenChange(false);
        router.push(`/restaurant/sales/new?table_id=${selectedTable.id}&session_id=${res.data?.session_id}`);
      } else {
        toast.error(res.message || 'Erreur lors de l’ouverture de la table.');
      }
    } else {
      cart.clearCart();
      cart.setOrderType(orderType);
      if (clientName) {
        cart.setClient(null, clientName, clientPhone);
      }
      toast.success(`Nouvelle commande (${orderType === 'takeaway' ? 'À emporter' : orderType === 'delivery' ? 'Livraison' : 'Comptoir'}) initiée !`);
      onOpenChange(false);
      router.push(`/restaurant/sales/new?order_type=${orderType}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl">
        <DialogHeader className="space-y-1 text-left border-b pb-4">
          <DialogTitle className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Sparkles size={20} className="text-orange-500" />
            Nouvelle Commande Restaurant
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Choisissez le mode de vente pour démarrer la saisie de la commande.
          </DialogDescription>
        </DialogHeader>

        {/* Choix du mode de vente */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <button
            type="button"
            onClick={() => setOrderType('dine_in')}
            className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
              orderType === 'dine_in'
                ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold shadow-sm'
                : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${orderType === 'dine_in' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Utensils size={20} />
            </div>
            <span className="text-xs font-semibold">Sur place</span>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('takeaway')}
            className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
              orderType === 'takeaway'
                ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold shadow-sm'
                : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${orderType === 'takeaway' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <ShoppingBag size={20} />
            </div>
            <span className="text-xs font-semibold">À emporter</span>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('delivery')}
            className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
              orderType === 'delivery'
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-sm'
                : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${orderType === 'delivery' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Bike size={20} />
            </div>
            <span className="text-xs font-semibold">Livraison</span>
          </button>

          <button
            type="button"
            onClick={() => setOrderType('counter')}
            className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
              orderType === 'counter'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${orderType === 'counter' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Zap size={20} />
            </div>
            <span className="text-xs font-semibold">Comptoir</span>
          </button>
        </div>

        {/* Détails spécifiques selon le mode choisi */}
        {orderType === 'dine_in' && (
          <div className="space-y-4 bg-gray-50/80 p-4 rounded-2xl border">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Utensils size={16} className="text-orange-600" />
                Sélection de la Table & Couverts
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Couverts :</span>
                <div className="flex items-center border bg-white rounded-lg">
                  <button
                    type="button"
                    onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                    className="px-2.5 py-1 text-sm hover:bg-gray-100 rounded-l-lg font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-900">{numberOfGuests}</span>
                  <button
                    type="button"
                    onClick={() => setNumberOfGuests(numberOfGuests + 1)}
                    className="px-2.5 py-1 text-sm hover:bg-gray-100 rounded-r-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Filtres par Espaces */}
            {spaces.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <Button
                  size="sm"
                  variant={selectedSpaceId === null ? 'default' : 'outline'}
                  onClick={() => setSelectedSpaceId(null)}
                  className="rounded-full text-xs h-7"
                >
                  Tous les espaces
                </Button>
                {spaces.map((sp) => (
                  <Button
                    key={sp.id}
                    size="sm"
                    variant={selectedSpaceId === sp.id ? 'default' : 'outline'}
                    onClick={() => setSelectedSpaceId(sp.id)}
                    className="rounded-full text-xs h-7"
                  >
                    {sp.name}
                  </Button>
                ))}
              </div>
            )}

            {/* Liste des Tables Libres */}
            {availableTables.length === 0 ? (
              <div className="text-center py-6 text-gray-500 bg-white rounded-xl border border-dashed">
                <p className="text-xs">Aucune table libre disponible actuellement dans cet espace.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                {availableTables.map((table) => {
                  const isSelected = selectedTable?.id === table.id;
                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => setSelectedTable(table)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-orange-600 bg-orange-600 text-white shadow-md font-bold'
                          : 'border-emerald-200 bg-white text-gray-800 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm truncate">
                          Table {table.table_number || table.table_name}
                        </span>
                        {isSelected && <Check size={14} className="text-white shrink-0" />}
                      </div>
                      <div className={`text-[10px] mt-1 flex items-center gap-1 ${isSelected ? 'text-orange-100' : 'text-gray-400'}`}>
                        <Users size={10} /> {table.capacity || 4} places
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(orderType === 'takeaway' || orderType === 'delivery') && (
          <div className="space-y-3 bg-gray-50/80 p-4 rounded-2xl border">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <User size={16} className="text-blue-600" />
              Informations du Client ({orderType === 'takeaway' ? 'À emporter' : 'Livraison'})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nom du client</label>
                <Input
                  placeholder="Ex: M. Coulibaly"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Téléphone client</label>
                <Input
                  placeholder="Ex: +223 70 00 00 00"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="bg-white text-sm"
                />
              </div>
            </div>
            {orderType === 'delivery' && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                  <MapPin size={12} /> Adresse de livraison
                </label>
                <Input
                  placeholder="Ex: Hamdallaye ACI 2000, Rue 340, Porte 12"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="bg-white text-sm"
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleStartOrder}
            disabled={loading || (orderType === 'dine_in' && !selectedTable)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-6"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <>
                <span>Démarrer la commande</span>
                <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
