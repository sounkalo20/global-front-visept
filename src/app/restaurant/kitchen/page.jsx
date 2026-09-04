'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ChefHat, Clock, CheckCircle2, Flame, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useCompanyStore from '@/store/companyStore';
import axios from '@/lib/axios';

export default function KitchenDisplayPage() {
  const { activeCompany } = useCompanyStore();
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchKitchenTickets = useCallback(async () => {
    if (!activeCompany?.id) return;
    try {
      const res = await axios.get('/restaurant/sales', {
        headers: { 'x-company-id': activeCompany.id },
      });
      if (res.data.success) {
        // Garder uniquement les ventes pending ou completed récemment ayant des plats non encore servis
        const activeSales = (res.data.data.sales || []).filter(s => s.status !== 'canceled');
        setSales(activeSales);
        setLastRefreshed(new Date());
      }
    } catch (error) {
      console.error('Erreur chargement KDS:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeCompany?.id]);

  useEffect(() => {
    fetchKitchenTickets();
    // Auto-refresh toutes les 12 secondes
    const interval = setInterval(fetchKitchenTickets, 12000);
    return () => clearInterval(interval);
  }, [fetchKitchenTickets]);

  const handleUpdateItemStatus = async (itemId, newStatus) => {
    try {
      const res = await axios.put(
        `/restaurant/sales/items/${itemId}/status`,
        { status: newStatus },
        { headers: { 'x-company-id': activeCompany.id } }
      );
      if (res.data.success) {
        toast.success(`Plat passé en : ${newStatus === 'preparing' ? 'Cuisson' : newStatus === 'ready' ? 'Prêt à servir' : 'Servi'}`);
        fetchKitchenTickets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut.');
    }
  };

  if (!activeCompany) return null;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-white p-4 lg:p-6 space-y-6">
      {/* Header KDS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <ChefHat size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Écran Cuisine (KDS) — Suivi des Bons</h1>
            <p className="text-xs text-slate-400">
              Dernière synchro : {lastRefreshed.toLocaleTimeString()} • Rafraîchissement automatique 12s
            </p>
          </div>
        </div>

        <Button
          onClick={fetchKitchenTickets}
          variant="outline"
          className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs"
        >
          <RefreshCw size={14} className="mr-2" /> Actualiser
        </Button>
      </div>

      {/* Grille des Bons Cuisine */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-800/50 animate-pulse rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-800">
          <ChefHat className="mx-auto h-16 w-16 text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-300">Aucun bon en attente en cuisine</h3>
          <p className="text-xs text-slate-500 mt-1">Les nouvelles commandes saisies sur le POS apparaîtront automatiquement ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sales.map((sale) => {
            const items = sale.items || [];
            if (items.length === 0) return null;

            return (
              <div
                key={sale.id}
                className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl"
              >
                {/* Entête du Bon */}
                <div className="bg-slate-700/80 px-4 py-3 border-b border-slate-600 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-amber-400">
                        {sale.table_id ? `Table #${sale.table_id}` : 'Comptoir / Emporter'}
                      </span>
                      <Badge className="bg-slate-900 text-slate-300 text-[10px] border-0">
                        {sale.sale_number}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      <span>{new Date(sale.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {sale.seller_name && <span>• Serveur : {sale.seller_name}</span>}
                    </div>
                  </div>
                </div>

                {/* Liste des Plats du Bon */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[350px]">
                  {items.map((item) => {
                    const status = item.item_status || 'pending';

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-slate-100">
                              {item.product_name}
                            </span>
                            <span className="ml-2 font-extrabold text-amber-400 text-sm">
                              ×{item.quantity}
                            </span>
                          </div>

                          <Badge
                            className={
                              status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]'
                                : status === 'preparing'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px]'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]'
                            }
                          >
                            {status === 'pending' ? 'Attente' : status === 'preparing' ? 'En Cuisson' : 'Prêt'}
                          </Badge>
                        </div>

                        {item.notes && (
                          <div className="text-xs italic text-amber-200 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/50">
                            Note : {item.notes}
                          </div>
                        )}

                        {/* Boutons d'action pour le chef */}
                        <div className="flex items-center gap-2 pt-1">
                          {status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateItemStatus(item.id, 'preparing')}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 rounded-lg"
                            >
                              <Flame size={12} className="mr-1" /> Cuisson
                            </Button>
                          )}

                          {status === 'preparing' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateItemStatus(item.id, 'ready')}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 rounded-lg"
                            >
                              <CheckCircle2 size={12} className="mr-1" /> Marquer Prêt
                            </Button>
                          )}

                          {status === 'ready' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateItemStatus(item.id, 'served')}
                              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs h-7 rounded-lg"
                            >
                              Archiver (Servi)
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
