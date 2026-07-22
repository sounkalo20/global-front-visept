'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductTable from '@/components/products/ProductTable';
import ProductModal from '@/components/products/ProductModal';
import DeleteProductDialog from '@/components/products/DeleteProductDialog';
import ProductFilters from '@/components/products/ProductFilters';
import ProductStats from '@/components/products/ProductStats';
import EmptyProductState from '@/components/products/EmptyProductState';
import ExportProductsPDFButton from '@/components/products/ExportProductsPDFButton';
import useProductStore from '@/store/productStore';
import useCompanyStore from '@/store/companyStore';
import useCategoryStore from '@/store/categoryStore';

export default function ProductsPage() {
  const { products, totalProducts, isLoading, fetchProducts } = useProductStore();
  const { activeCompany } = useCompanyStore();
  const { fetchCategories } = useCategoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const loadData = useCallback(() => {
    if (activeCompany) {
      const params = { sort_by: sortBy };
      if (search) params.search = search;
      if (stockFilter === 'low') params.low_stock = 'true';
      fetchProducts(activeCompany.id, params);
      fetchCategories(activeCompany.id);
    }
  }, [activeCompany, search, stockFilter, sortBy]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtrage frontend complémentaire
  const filteredProducts = products.filter((product) => {
    if (stockFilter === 'out') return product.current_stock <= 0;
    return true;
  });

  if (!activeCompany) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyProductState onCreate={() => {}} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
            <p className="text-gray-500 mt-1">{totalProducts} produit{totalProducts > 1 ? 's' : ''}</p>
          </div>
          {products.length > 0 && (
            <div className="flex items-center gap-3">
              <ExportProductsPDFButton />
              <Button onClick={() => { setEditingProduct(null); setModalOpen(true); }}>
                <Plus size={18} className="mr-2" /> Nouveau produit
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : products.length === 0 && !search && !stockFilter ? (
          <EmptyProductState onCreate={() => setModalOpen(true)} />
        ) : (
          <>
            {products.length > 0 && <ProductStats products={filteredProducts} />}
            <ProductFilters
              search={search}
              onSearchChange={setSearch}
              stockFilter={stockFilter}
              onStockFilterChange={setStockFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
            <ProductTable
              products={filteredProducts}
              onEdit={(p) => { setEditingProduct(p); setModalOpen(true); }}
              onDelete={setDeletingProduct}
            />
          </>
        )}
      </motion.div>

      <ProductModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingProduct(null); }}
        product={editingProduct}
        onSuccess={loadData}
      />

      <DeleteProductDialog
        product={deletingProduct}
        open={!!deletingProduct}
        onOpenChange={(open) => { if (!open) setDeletingProduct(null); }}
        onSuccess={loadData}
      />
    </div>
  );
}