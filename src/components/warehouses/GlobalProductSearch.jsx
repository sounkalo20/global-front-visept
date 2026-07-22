'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { warehouseApi } from '@/lib/api/warehouses';


export default function GlobalProductSearch({ onSelectProduct }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      searchProducts();
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  const searchProducts = async () => {
    setIsSearching(true);
    try {
      const response = await warehouseApi.searchGlobalProducts(debouncedQuery);
      setResults(response.data.data || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Erreur lors de la recherche', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (product) => {
    setQuery('');
    setIsOpen(false);
    onSelectProduct(product);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Recherche intelligente de produit..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          className="pl-10 h-12 bg-white border-gray-200 shadow-sm rounded-xl text-base"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={18} />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.catalog_product_id}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-0 text-left transition-colors"
              onClick={() => handleSelect(product)}
            >
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded border object-cover" />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                  <Package size={18} />
                </div>
              )}
              <div>
                <p className="font-medium text-sm text-gray-900">{product.name}</p>
                {product.barcode && <p className="text-xs text-gray-500">Code: {product.barcode}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isOpen && !isSearching && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-lg z-50 p-4 text-center text-gray-500 text-sm">
          Aucun produit trouvé.
        </div>
      )}
    </div>
  );
}
