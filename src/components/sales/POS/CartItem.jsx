// app/shop/sales/new/CartItem.jsx (REMPLACER)
'use client';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartItem({ item, onUpdateQuantity, onUpdatePrice, onRemove }) {
  const handlePriceTypeChange = (newType) => {
    const newPrice = newType === 'wholesale'
      ? (item.original_wholesale_price || item.wholesale_price)
      : (item.original_retail_price || item.retail_price);
    onUpdatePrice(item.product_id, newPrice, newType);
  };

  return (
    <div className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
      {/* Nom + supprimer */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">
          {item.product_name}
        </p>
        <button
          onClick={() => onRemove(item.product_id)}
          className="shrink-0 text-gray-300 hover:text-red-500 transition-colors mt-0.5"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Contrôles */}
      <div className="flex items-center gap-3">
        {/* Type de prix */}
        <select
          value={item.price_type || 'retail'}
          onChange={(e) => handlePriceTypeChange(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:border-brand-300"
        >
          <option value="retail">Détail</option>
          {item.wholesale_price > 0 && <option value="wholesale">Gros</option>}
        </select>

        {/* Prix unitaire */}
        <input
          type="number"
          value={item.unit_price}
          onChange={(e) => onUpdatePrice(item.product_id, parseFloat(e.target.value) || 0)}
          className="w-20 text-xs text-center border border-gray-200 rounded-lg px-1 py-1.5 focus:outline-none focus:border-brand-300"
          min="0"
        />

        {/* Quantité */}
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <Minus size={13} />
          </button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
            disabled={item.manage_stock && item.quantity >= item.current_stock}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-30"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {/* Total ligne */}
      <p className="text-right text-sm font-semibold text-brand-700 mt-1">
        {(item.unit_price * item.quantity).toLocaleString()} FCFA
      </p>
    </div>
  );
}