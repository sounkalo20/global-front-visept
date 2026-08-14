'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Calendar, History, User, Info, Coins, Package, Box } from 'lucide-react';
import { productsApi } from '@/lib/api/products';
import { cn } from '@/lib/utils';

export default function ProductDetailModal({ open, onOpenChange, product, companyId }) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'movements'
  const [movementTab, setMovementTab] = useState('boutique'); // 'boutique' or 'warehouse'
  const [movementsData, setMovementsData] = useState({ boutiqueMovements: [], warehouseMovements: [] });
  const [loadingMovements, setLoadingMovements] = useState(false);

  useEffect(() => {
    if (open && product) {
      setLoadingMovements(true);
      productsApi.getMovements(product.id, companyId)
        .then(res => {
          if (res.data?.success) {
            setMovementsData(res.data.data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingMovements(false));
    }
  }, [open, product, companyId]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-[#374151] px-6 py-4 flex items-center gap-4 shrink-0 bg-white dark:bg-[#111827]">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl object-cover border border-gray-200 dark:border-[#374151]" />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center border border-gray-200 dark:border-[#374151]">
              <Package size={28} className="text-brand-600 dark:text-brand-400" />
            </div>
          )}
          <div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB]">{product.name}</DialogTitle>
            <p className="text-xs text-gray-400 dark:text-[#9CA3AF] mt-0.5">ID Boutique: #{product.id} {product.sku ? `| SKU: ${product.sku}` : ''}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-[#374151] px-6 bg-gray-50 dark:bg-[#1F2937]/50 shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              "py-3 text-sm font-semibold border-b-2 px-3 transition-all",
              activeTab === 'info' ? "border-brand-600 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 dark:text-[#9CA3AF] hover:text-gray-700 dark:hover:text-[#F9FAFB]"
            )}
          >
            Fiche Produit
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={cn(
              "py-3 text-sm font-semibold border-b-2 px-3 transition-all",
              activeTab === 'movements' ? "border-brand-600 text-brand-600 dark:text-brand-400" : "border-transparent text-gray-500 dark:text-[#9CA3AF] hover:text-gray-700 dark:hover:text-[#F9FAFB]"
            )}
          >
            Historique du Stock
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-[#0B0F14]">
          
          {activeTab === 'info' && (
            <div className="space-y-6">
              
              {/* Tarifs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-xl shadow-xs">
                  <p className="text-xs font-semibold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wider">Prix de revient</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB] mt-1">{parseFloat(product.cost_price).toLocaleString()} F</p>
                </div>
                <div className="p-4 bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/60 rounded-xl shadow-xs">
                  <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider">Prix de détail</p>
                  <p className="text-lg font-bold text-brand-800 dark:text-brand-200 mt-1">
                    {!product.is_available && parseFloat(product.retail_price) === 0 ? (
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full">À définir</span>
                    ) : (
                      `${parseFloat(product.retail_price).toLocaleString()} F`
                    )}
                  </p>
                </div>
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl shadow-xs">
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Prix de gros</p>
                  <p className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mt-1">{product.wholesale_price > 0 ? `${parseFloat(product.wholesale_price).toLocaleString()} F` : '-'}</p>
                </div>
              </div>

              {/* Inventaire */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                      <Box size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF]">Stock boutique actuel</p>
                      <p className="text-base font-bold text-gray-900 dark:text-[#F9FAFB] mt-0.5">{Number(product.current_stock)} {product.unit_symbol || 'pcs'}</p>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] rounded-xl p-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
                      <Info size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-[#9CA3AF]">Seuil d'alerte</p>
                      <p className="text-base font-bold text-gray-900 dark:text-[#F9FAFB] mt-0.5">{product.low_stock_threshold} unités</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classification */}
              <div className="border border-gray-200 dark:border-[#374151] rounded-xl p-4 space-y-3 bg-white dark:bg-[#111827] shadow-xs">
                <h4 className="text-sm font-bold text-gray-900 dark:text-[#F9FAFB] border-b border-gray-100 dark:border-[#374151] pb-2">Détails d'identification</h4>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <span className="text-gray-500 dark:text-[#9CA3AF]">Catégorie :</span>
                  <span className="font-semibold text-gray-800 dark:text-[#F9FAFB] text-right">{product.category_name || 'Non classé'}</span>

                  <span className="text-gray-500 dark:text-[#9CA3AF]">Code-barres :</span>
                  <span className="font-mono font-medium text-gray-800 dark:text-[#F9FAFB] text-right">{product.barcode || '-'}</span>

                  <span className="text-gray-500 dark:text-[#9CA3AF]">Description :</span>
                  <span className="font-medium text-gray-800 dark:text-[#F9FAFB] text-right">{product.description || '-'}</span>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-4">
              {product.catalog_product_id && (
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-[#1F2937] rounded-xl">
                  <button
                    onClick={() => setMovementTab('boutique')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                      movementTab === 'boutique' ? "bg-white dark:bg-[#111827] text-gray-900 dark:text-[#F9FAFB] shadow-xs" : "text-gray-500 dark:text-[#9CA3AF] hover:text-gray-800 dark:hover:text-[#F9FAFB]"
                    )}
                  >
                    Boutique ({movementsData.boutiqueMovements?.length || 0})
                  </button>
                  <button
                    onClick={() => setMovementTab('warehouse')}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                      movementTab === 'warehouse' ? "bg-white dark:bg-[#111827] text-gray-900 dark:text-[#F9FAFB] shadow-xs" : "text-gray-500 dark:text-[#9CA3AF] hover:text-gray-800 dark:hover:text-[#F9FAFB]"
                    )}
                  >
                    Entrepôts ({movementsData.warehouseMovements?.length || 0})
                  </button>
                </div>
              )}

              {loadingMovements ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-brand-600" size={24} />
                </div>
              ) : movementTab === 'boutique' ? (
                /* boutique movements */
                <div className="space-y-2">
                  {movementsData.boutiqueMovements?.length === 0 ? (
                    <p className="text-sm text-center text-gray-500 dark:text-[#D1D5DB] py-6">Aucun mouvement enregistré pour cette boutique.</p>
                  ) : (
                    movementsData.boutiqueMovements.map((m) => (
                      <div key={m.id} className="flex justify-between items-start p-3.5 border border-gray-200 dark:border-[#374151] rounded-xl text-sm bg-white dark:bg-[#111827] hover:bg-gray-50/50 dark:hover:bg-[#1F2937]/50 transition-colors shadow-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded font-medium",
                              m.movement_type === 'sale' ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300" :
                              m.movement_type === 'purchase' ? "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300" :
                              m.movement_type === 'transfer_in' ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300" :
                              "bg-gray-100 dark:bg-[#1F2937] text-gray-700 dark:text-[#D1D5DB]"
                            )}>
                              {m.movement_type === 'sale' ? 'Vente' :
                               m.movement_type === 'purchase' ? 'Achat/Réception' :
                               m.movement_type === 'transfer_in' ? 'Transfert Entrant' :
                               m.movement_type === 'loss' ? 'Perte' : m.movement_type}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-[#9CA3AF] font-mono">#{m.id}</span>
                          </div>
                          {m.note && <p className="text-xs text-gray-500 dark:text-[#D1D5DB] mt-1">{m.note}</p>}
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-[#9CA3AF] mt-1">
                            <User size={10} />
                            <span>Par {m.performed_by_name || 'Système'}</span>
                            <span>•</span>
                            <Calendar size={10} />
                            <span>{new Date(m.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={cn(
                            "font-bold text-sm",
                            parseFloat(m.quantity) > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {parseFloat(m.quantity) > 0 ? '+' : ''}{m.quantity} {product.unit_symbol || 'pcs'}
                          </span>
                          <p className="text-[10px] text-gray-400 dark:text-[#9CA3AF] mt-1">
                            Avant: {m.stock_before} | Après: {m.stock_after}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* warehouse movements */
                <div className="space-y-2">
                  {movementsData.warehouseMovements?.length === 0 ? (
                    <p className="text-sm text-center text-gray-500 dark:text-[#D1D5DB] py-6">Aucun mouvement enregistré dans les entrepôts.</p>
                  ) : (
                    movementsData.warehouseMovements.map((wm) => (
                      <div key={wm.id} className="flex justify-between items-start p-3.5 border border-gray-200 dark:border-[#374151] rounded-xl text-sm bg-white dark:bg-[#111827] hover:bg-gray-50/50 dark:hover:bg-[#1F2937]/50 transition-colors shadow-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded font-medium",
                              wm.movement_type === 'in_from_supplier' ? "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300" :
                              wm.movement_type === 'transfer_to_shop' ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300" :
                              "bg-gray-100 dark:bg-[#1F2937] text-gray-700 dark:text-[#D1D5DB]"
                            )}>
                              {wm.movement_type === 'in_from_supplier' ? 'Réception Fournisseur' :
                               wm.movement_type === 'transfer_to_shop' ? 'Transfert Boutique' :
                               wm.movement_type}
                            </span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-[#D1D5DB]">{wm.warehouse_name}</span>
                          </div>
                          {wm.notes && <p className="text-xs text-gray-500 dark:text-[#D1D5DB] mt-1">{wm.notes}</p>}
                          {wm.destination_company_name && (
                            <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium mt-0.5">Vers : {wm.destination_company_name}</p>
                          )}
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-[#9CA3AF] mt-1">
                            <User size={10} />
                            <span>Par {wm.performed_by_name || 'Système'}</span>
                            <span>•</span>
                            <Calendar size={10} />
                            <span>{new Date(wm.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={cn(
                            "font-bold text-sm",
                            parseFloat(wm.quantity) > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}>
                            {parseFloat(wm.quantity) > 0 ? '+' : ''}{wm.quantity} {product.unit_symbol || 'pcs'}
                          </span>
                          <p className="text-[10px] text-gray-400 dark:text-[#9CA3AF] mt-1">
                            Avant: {wm.stock_before} | Après: {wm.stock_after}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
