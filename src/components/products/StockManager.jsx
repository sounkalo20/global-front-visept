'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Minus, Plus, Loader2, ArrowRightLeft, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useProductStore from '@/store/productStore';
import useCompanyStore from '@/store/companyStore';
import useWarehouseStore from '@/store/warehouseStore';

export default function StockManager({ product, onClose }) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'transfer'
  
  // Tab 1: Manual
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateStock, fetchProducts } = useProductStore();
  const { activeCompany } = useCompanyStore();

  // Tab 2: Transfer
  const { fetchProductWarehouseStocks, transferToShop } = useWarehouseStore();
  const [warehouseStocksList, setWarehouseStocksList] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  useEffect(() => {
    if (activeTab === 'transfer' && product.catalog_product_id) {
      setLoadingWarehouses(true);
      fetchProductWarehouseStocks(product.catalog_product_id).then(res => {
        setWarehouseStocksList(res || []);
        if (res && res.length > 0) {
          // Select first warehouse with stock, or just the first one
          const withStock = res.find(w => parseFloat(w.quantity) > 0);
          setSelectedWarehouseId(withStock ? String(withStock.warehouse_id) : String(res[0].warehouse_id));
        }
        setLoadingWarehouses(false);
      });
    }
  }, [activeTab, product.catalog_product_id]);

  const handleStockAction = async (type, qty = null) => {
    const finalQty = qty !== null ? qty : parseInt(quantity);
    if (!finalQty || finalQty <= 0) {
      toast.error('Veuillez entrer une quantité valide.');
      return;
    }

    setIsSubmitting(true);
    const movementType = type === 'add' ? 'purchase' : type === 'remove' ? 'loss' : type;

    const result = await updateStock(product.id, activeCompany.id, {
      quantity: finalQty,
      movement_type: movementType,
      note: `Ajustement manuel`,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Stock mis à jour.');
      fetchProducts(activeCompany.id);
      onClose?.();
    } else {
      toast.error(result.message);
    }
  };

  const handleTransferSubmit = async () => {
    const qty = parseFloat(transferQty);
    if (!qty || qty <= 0) {
      toast.error('Veuillez entrer une quantité de transfert valide.');
      return;
    }

    if (!selectedWarehouseId) {
      toast.error('Veuillez sélectionner un entrepôt.');
      return;
    }

    const selectedWh = warehouseStocksList.find(w => String(w.warehouse_id) === selectedWarehouseId);
    if (!selectedWh) return;

    if (parseFloat(selectedWh.quantity) < qty) {
      toast.error('Stock insuffisant dans cet entrepôt.');
      return;
    }

    setIsSubmitting(true);
    try {
      await transferToShop(selectedWarehouseId, {
        product_id: product.catalog_product_id,
        quantity: qty,
        destination_company_id: activeCompany.id,
        notes: `Transfert direct depuis le stock de l'entrepôt`
      });
      toast.success('Transfert effectué avec succès !');
      fetchProducts(activeCompany.id);
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du transfert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedWarehouse = warehouseStocksList.find(w => String(w.warehouse_id) === selectedWarehouseId);

  return (
    <div className="space-y-5">
      {/* Tabs */}
      {activeCompany?.my_role === 'owner' && product.catalog_product_id && (
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'manual'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Ajustement Manuel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'transfer'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Transfert Entrepôt → Boutique
          </button>
        </div>
      )}

      {/* Info Stock Boutique Actuel */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-600">
          <Box size={18} />
          <span className="text-sm font-medium">Stock boutique actuel :</span>
        </div>
        <span className="font-bold text-slate-800 text-base">
          {product.current_stock} {product.unit_symbol || 'pcs'}
        </span>
      </div>

      {activeTab === 'manual' ? (
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="1"
              placeholder="Quantité"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-11 flex-1 text-center font-medium"
            />
            <Button
              variant="outline"
              onClick={() => handleStockAction('add')}
              disabled={isSubmitting}
              className="h-11 px-4 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 gap-1.5"
            >
              <Plus size={16} /> Ajouter
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStockAction('remove')}
              disabled={isSubmitting}
              className="h-11 px-4 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-1.5"
            >
              <Minus size={16} /> Retirer
            </Button>
          </div>

          <div className="flex gap-2">
            {[1, 5, 10, 20].map((qty) => (
              <Button
                key={qty}
                variant="outline"
                size="sm"
                onClick={() => handleStockAction('add', qty)}
                disabled={isSubmitting}
                className="flex-1 h-9 text-xs font-semibold"
              >
                +{qty}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {loadingWarehouses ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-brand-600" size={24} />
            </div>
          ) : warehouseStocksList.length === 0 ? (
            <p className="text-sm text-center text-gray-500 py-4">Aucun entrepôt disponible.</p>
          ) : (
            <>
              {/* Select Warehouse */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrepôt Source</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all appearance-none"
                  style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2394a3b8%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  {warehouseStocksList.map((wh) => (
                    <option key={wh.warehouse_id} value={wh.warehouse_id}>
                      {wh.warehouse_name} ({wh.quantity} restants)
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock in selected warehouse */}
              {selectedWarehouse && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex justify-between text-sm">
                  <span className="text-amber-800 font-medium">Stock disponible en entrepôt :</span>
                  <span className="font-bold text-amber-900">{selectedWarehouse.quantity} {product.unit_symbol || 'pcs'}</span>
                </div>
              )}

              {/* Quantity to transfer */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantité à transférer</label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    min="1"
                    max={selectedWarehouse ? selectedWarehouse.quantity : undefined}
                    value={transferQty}
                    onChange={(e) => setTransferQty(e.target.value)}
                    className="h-11 flex-1 text-center font-medium"
                  />
                  <Button
                    onClick={handleTransferSubmit}
                    disabled={isSubmitting || !selectedWarehouse || parseFloat(selectedWarehouse.quantity) <= 0}
                    className="h-11 px-6 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold gap-1.5"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <ArrowRightLeft size={16} />
                    )}
                    Transférer
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}