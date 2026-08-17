'use client';
import { useState } from 'react';
import { Search, Plus, Minus, X, PackageX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const STOCK_BADGES = {
  out: { label: 'Rupture', dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50' },
  low: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' },
  ok: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
};

function getStockInfo(product) {
  if (!product.manage_stock) return null;
  if (product.current_stock <= 0) return { ...STOCK_BADGES.out };
  if (product.current_stock <= product.low_stock_threshold) {
    return { ...STOCK_BADGES.low, label: `${Number(product.current_stock)} restants` };
  }
  return { ...STOCK_BADGES.ok, label: `${Number(product.current_stock)} en stock` };
}

export default function ProductGrid({ products, cartItems, onAddToCart, onUpdateQuantity, onRemoveItem }) {
  const [search, setSearch] = useState('');

  const filtered = products.filter(
    (p) =>
      (p.is_available === 1 || p.is_available === true) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()))
  );

  const getItemInCart = (productId) => cartItems.find((item) => item.product_id === productId);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0B0F14]">
      <div className="p-3 border-b border-gray-200 dark:border-[#374151] shrink-0 bg-white dark:bg-[#111827]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#9CA3AF]" />
          <Input
            placeholder="Rechercher un produit ou une référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#9CA3AF] hover:text-gray-600 dark:hover:text-white"
              aria-label="Effacer la recherche"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* pb-24 sur mobile pour ne pas masquer les derniers produits sous la barre de panier flottante */}
      <div className="flex-1 overflow-y-auto p-3 pb-24 lg:pb-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-[#9CA3AF] py-16">
            <PackageX size={40} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">Aucun produit trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filtered.map((product) => {
              const stock = getStockInfo(product);
              const inCart = getItemInCart(product.id);
              const outOfStock = product.manage_stock && product.current_stock <= 0;

              return (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={outOfStock ? -1 : 0}
                  onClick={() => !outOfStock && onAddToCart(product)}
                  onKeyDown={(e) => {
                    if (!outOfStock && (e.key === 'Enter' || e.key === ' ')) onAddToCart(product);
                  }}
                  className={cn(
                    'text-left rounded-2xl border p-3.5 transition-all select-none shadow-xs',
                    outOfStock
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-[#111827]/40 border-gray-200 dark:border-[#374151]'
                      : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md active:scale-[0.98]',
                    inCart && !outOfStock && 'border-brand-500 dark:border-brand-400 bg-brand-50/40 dark:bg-brand-950/40 ring-1 ring-brand-500/30'
                  )}
                >
                  <p className="font-semibold text-sm text-gray-900 dark:text-[#F9FAFB] line-clamp-2 min-h-[2.5em]">
                    {product.name}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 gap-1">
                    <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                      {parseFloat(product.retail_price).toLocaleString('fr-FR')} F
                    </p>
                    {stock && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full shrink-0 font-medium',
                          stock.bg,
                          stock.text
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', stock.dot)} />
                        {stock.label}
                      </span>
                    )}
                  </div>

                  {/* Stepper rapide quand le produit est déjà dans le panier */}
                  {/* {inCart && (
                    <div
                      className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-brand-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          inCart.quantity <= 1
                            ? onRemoveItem(product.id)
                            : onUpdateQuantity(product.id, inCart.quantity - 1)
                        }
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-brand-200 text-brand-700 hover:bg-brand-100"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-sm font-bold text-brand-700">{inCart.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onAddToCart(product)}
                        disabled={product.manage_stock && inCart.quantity >= product.current_stock}
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-brand-200 text-brand-700 hover:bg-brand-100 disabled:opacity-30"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  )} */}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}