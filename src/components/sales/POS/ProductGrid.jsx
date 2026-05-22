'use client';
import { useState } from 'react';
import { Search, Plus, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function ProductGrid({ products, onAddToCart, cartItems }) {
  const [search, setSearch] = useState('');

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) ||
           p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const getStockBadge = (product) => {
    if (!product.manage_stock) return null;
    if (product.current_stock <= 0) return { label: 'Rupture', color: 'text-red-600 bg-red-50' };
    if (product.current_stock <= product.low_stock_threshold) return { label: 'Faible', color: 'text-amber-600 bg-amber-50' };
    return { label: `${product.current_stock}`, color: 'text-green-600 bg-green-50' };
  };

  const getItemInCart = (productId) => {
    return cartItems.find((item) => item.product_id === productId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {filtered.map((product) => {
            const badge = getStockBadge(product);
            const inCart = getItemInCart(product.id);
            const outOfStock = product.manage_stock && product.current_stock <= 0;

            return (
              <button
                key={product.id}
                onClick={() => !outOfStock && onAddToCart(product)}
                disabled={outOfStock}
                className={cn(
                  'text-left rounded-xl border p-3 transition-all hover:border-brand-300 hover:shadow-sm',
                  outOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white cursor-pointer',
                  inCart && 'border-brand-500 bg-brand-50 ring-1 ring-brand-200'
                )}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                  {inCart && (
                    <span className="shrink-0 bg-brand-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {inCart.quantity}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm font-semibold text-brand-700">
                    {parseFloat(product.retail_price).toLocaleString()} F
                  </p>
                  {badge && (
                    <span className={cn('text-xs px-1.5 py-0.5 rounded', badge.color)}>
                      {badge.label}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">Aucun produit trouvé</p>
        )}
      </div>
    </div>
  );
}