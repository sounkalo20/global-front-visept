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
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-[#9CA3AF] py-12 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1F2937] flex items-center justify-center mb-4">
          <ShoppingCart size={36} className="opacity-40" />
        </div>
        <p className="font-semibold text-gray-700 dark:text-[#F9FAFB]">Panier vide</p>
        <p className="text-sm mt-1 text-center text-gray-400 dark:text-[#9CA3AF]">Cliquez sur un produit pour l'ajouter au panier</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111827]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-[#374151] bg-gray-50 dark:bg-[#1F2937]/50">
        <span className="text-sm font-semibold text-gray-800 dark:text-[#F9FAFB]">
          {items.length} article{items.length > 1 ? 's' : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => cart.clearCart()}
          className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 dark:hover:bg-red-950/30 h-7"
        >
          <Trash2 size={14} className="mr-1" />
          Vider
        </Button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#374151]/50">
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
      <div className="border-t border-gray-200 dark:border-[#374151] bg-gray-50/80 dark:bg-[#1F2937]/50 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-[#9CA3AF]">Sous-total</span>
          <span className="font-semibold text-gray-900 dark:text-[#F9FAFB]">{subtotal.toLocaleString()} FCFA</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Remise</span>
            <span className="font-semibold">-{discountAmount.toLocaleString()} FCFA</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-[#374151]">
          <span className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">Total</span>
          <span className="text-xl font-bold text-brand-700 dark:text-brand-400">{total.toLocaleString()} FCFA</span>
        </div>
      </div>
    </div>
  );
}