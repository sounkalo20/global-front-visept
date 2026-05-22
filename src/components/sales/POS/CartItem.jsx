'use client';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartItem({ item, onUpdateQuantity, onUpdatePrice, onRemove }) {
  // Fonction pour gérer le changement de type de prix
  const handlePriceTypeChange = (newType) => {
    // Récupérer le prix original du produit selon le type choisi
    const newPrice = newType === 'wholesale' 
      ? (item.original_wholesale_price || item.wholesale_price) 
      : (item.original_retail_price || item.retail_price);
    
    // Mettre à jour le prix ET le type de prix
    onUpdatePrice(item.product_id, newPrice, newType);
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.product_name}</p>
        <div className="flex items-center gap-2 mt-1">
          {/* Prix unitaire éditable */}
          <input
            type="number"
            value={item.unit_price}
            onChange={(e) => onUpdatePrice(item.product_id, e.target.value)}
            className="w-20 h-7 text-xs border rounded px-1.5 text-center"
            min="0"
            step="1"
          />
          <span className="text-xs text-gray-400">FCFA</span>

          {/* Type de prix */}
          <select
            value={item.price_type || 'retail'}
            onChange={(e) => handlePriceTypeChange(e.target.value)}
            className="text-xs border rounded px-1 h-7"
          >
            <option value="retail">Détail</option>
            {item.wholesale_price > 0 && <option value="wholesale">Gros</option>}
          </select>
        </div>
      </div>

      {/* Quantité */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
          className="h-7 w-7 flex items-center justify-center rounded border hover:bg-gray-100"
        >
          <Minus size={12} />
        </button>
        <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
          disabled={item.manage_stock && item.quantity >= item.current_stock}
          className="h-7 w-7 flex items-center justify-center rounded border hover:bg-gray-100 disabled:opacity-30"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Total ligne */}
      <p className="w-20 text-right font-medium text-sm">
        {(item.unit_price * item.quantity).toLocaleString()} F
      </p>

      {/* Supprimer */}
      <button onClick={() => onRemove(item.product_id)} className="text-red-400 hover:text-red-600">
        <Trash2 size={15} />
      </button>
    </div>
  );
}