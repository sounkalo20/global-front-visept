// app/shop/sales/new/CartPanel.jsx (REMPLACER)
'use client';
import CartItem from './CartItem';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCartStore from '@/store/cartStore';

export default function CartPanel({ items, onUpdateQuantity, onUpdatePrice, onRemoveItem, subtotal, discountAmount, total }) {
  const cart = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <ShoppingCart size={36} className="opacity-40" />
        </div>
        <p className="font-medium text-gray-500">Panier vide</p>
        <p className="text-sm mt-1 text-center">Cliquez sur un produit pour l'ajouter au panier</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <span className="text-sm font-medium text-gray-700">
          {items.length} article{items.length > 1 ? 's' : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => cart.clearCart()}
          className="text-xs text-red-500 hover:text-red-700 h-7"
        >
          <Trash2 size={14} className="mr-1" />
          Vider
        </Button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
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
      <div className="border-t bg-gray-50/80 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Sous-total</span>
          <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Remise</span>
            <span className="font-medium">-{discountAmount.toLocaleString()} FCFA</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-base font-semibold">Total</span>
          <span className="text-xl font-bold text-brand-700">{total.toLocaleString()} FCFA</span>
        </div>
      </div>
    </div>
  );
}