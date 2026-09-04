'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Utensils, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
import axios from '@/lib/axios';
import useCompanyStore from '@/store/companyStore';
import useRestaurantCartStore from '@/store/restaurantCartStore';

export default function OrderSessionTabs({ onOpenTableSelector }) {
  const { activeCompany } = useCompanyStore();
  const cart = useRestaurantCartStore();
  const [activeTables, setActiveTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActiveSessions = async () => {
    if (!activeCompany?.id) return;
    try {
      const res = await axios.get('/restaurant/tables');
      if (res.data?.success) {
        const tables = res.data.data?.tables || [];
        // Filtrer les tables occupées ou avec session active
        const occupied = tables.filter(t => t.status === 'occupied' || t.status === 'bill_requested' || t.session_id);
        setActiveTables(occupied);
      }
    } catch (err) {
      console.error('Erreur chargement sessions actives:', err);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 10000);
    return () => clearInterval(interval);
  }, [activeCompany?.id]);

  const handleSelectTableSession = (table) => {
    cart.setTableSession({
      tableId: table.id,
      tableSessionId: table.session_id || table.current_session_id,
      tableName: table.table_number ? `Table #${table.table_number}` : table.table_name,
      numberOfGuests: table.number_of_guests || table.capacity || 1,
      staffId: table.staff_id,
      staffName: table.staff_name,
    });

    if (table.items && table.items.length > 0) {
      cart.setItems(table.items.map(i => ({
        product_id: i.product_id,
        name: i.product_name,
        image_url: i.image_url,
        unit_price: Number(i.unit_price),
        quantity: Number(i.quantity),
        price_type: i.price_type || 'retail',
        discount_amount: Number(i.discount_amount || 0),
        modifiers_total: Number(i.modifiers_total || 0),
        modifiers: [],
        notes: i.notes || '',
        item_status: i.item_status || 'pending',
      })));
    } else {
      cart.clearCart();
    }
  };

  return (
    <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 overflow-x-auto border-b border-slate-800 shadow-inner">
      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
        <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 shrink-0 mr-1">
          <Utensils size={14} className="text-amber-400" /> Sessions en cours :
        </span>

        {/* Bouton Nouvelle Session / Table */}
        <Button
          onClick={onOpenTableSelector}
          size="sm"
          className="h-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl px-3 flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Plus size={15} /> + Choisir / Ouvrir une Table
        </Button>

        {/* Liste des tables & sessions actives */}
        {activeTables.map((t) => {
          const isSelected = cart.tableId === t.id;
          const tableLabel = t.table_number ? `Table #${t.table_number}` : t.table_name;
          const itemsTotal = t.total_amount || 0;

          return (
            <button
              key={t.id}
              onClick={() => handleSelectTableSession(t)}
              className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 border ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-400 shadow-md ring-2 ring-brand-400/30'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span>{tableLabel}</span>
              <Badge className={isSelected ? 'bg-white text-brand-900 text-[10px] font-extrabold' : 'bg-slate-700 text-amber-300 text-[10px]'}>
                {t.items_count ? `${t.items_count} plats` : `${t.number_of_guests || 2} pers`}
              </Badge>
            </button>
          );
        })}
      </div>

      {cart.tableName && (
        <div className="shrink-0 flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700">
          <span className="text-xs font-bold text-emerald-400">En cours : {cart.tableName}</span>
        </div>
      )}
    </div>
  );
}
