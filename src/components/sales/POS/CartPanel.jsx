'use client';
import CartItem from './CartItem';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

export default function CartPanel({
  items,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveItem,
  subtotal,
  discountAmount,
  total,
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
        <ShoppingCart size={48} className="mb-3 opacity-50" />
        <p className="text-sm">Panier vide</p>
        <p className="text-xs mt-1">Cliquez sur un produit pour l'ajouter</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4">
        {items.map((item) => (
          <CartItem
            key={item.product_id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onUpdatePrice={onUpdatePrice}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Résumé */}
      <div className="border-t bg-gray-50 p-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Sous-total</span>
          <span>{subtotal.toLocaleString()} FCFA</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Remise</span>
            <span>-{discountAmount.toLocaleString()} FCFA</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg pt-1 border-t">
          <span>Total</span>
          <span>{total.toLocaleString()} FCFA</span>
        </div>
      </div>
    </div>
  );
}