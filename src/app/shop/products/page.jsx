'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductTable from '@/components/products/ProductTable';
import ProductModal from '@/components/products/ProductModal';
import DeleteProductDialog from '@/components/products/DeleteProductDialog';
import ProductFilters from '@/components/products/ProductFilters';
import ProductStats from '@/components/products/ProductStats';
import EmptyProductState from '@/components/products/EmptyProductState';
import ExportProductsPDFButton from '@/components/products/ExportProductsPDFButton';
import DataImportModal from '@/components/common/DataImportModal';
import DataExportButton from '@/components/common/DataExportButton';
import useProductStore from '@/store/productStore';
import useCompanyStore from '@/store/companyStore';
import useCategoryStore from '@/store/categoryStore';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PageSizeSelector, { getStoredPageSize } from "@/components/ui/PageSizeSelector";

export default function ProductsPage() {
  const { products, totalProducts, totalPages, isLoading, fetchProducts, reactivateProduct } = useProductStore();
  const { activeCompany } = useCompanyStore();
  const { fetchCategories } = useCategoryStore();
  const { canAddMore, limits } = useSubscription();

  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getStoredPageSize(20));

  const loadData = useCallback(() => {
    if (activeCompany) {
      const params = { sort_by: sortBy, page, limit: pageSize };
      if (search) params.search = search;
      if (stockFilter === 'low') params.low_stock = 'true';
      fetchProducts(activeCompany.id, params);
      fetchCategories(activeCompany.id);
    }
  }, [activeCompany, search, stockFilter, sortBy, page, pageSize]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtrage frontend complémentaire
  const filteredProducts = products.filter((product) => {
    // Statut
    if (statusFilter === 'active' && product.is_active === 0) return false;
    if (statusFilter === 'inactive' && product.is_active === 1) return false;

    // Stock
    if (stockFilter === 'out' && product.current_stock > 0) return false;
    
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
    <PermissionGuard requiredPermission="products.view">
      <div className="mx-auto max-w-6xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
            <p className="text-gray-500 mt-1">{totalProducts} produit{totalProducts > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <DataExportButton moduleName="products" />
            <ExportProductsPDFButton />
            
            <HasPermission required="products.create">
              <Button
                variant="outline"
                onClick={() => setImportModalOpen(true)}
                className="border-brand-200 text-brand-700 hover:bg-brand-50 h-9 font-medium"
              >
                <Upload size={16} className="mr-1.5 text-brand-600" /> Importer
              </Button>

              <Button 
                onClick={() => { 
                  if (!canAddMore('max_products', totalProducts)) {
                    toast.error(`Limite atteinte : Vous avez atteint la limite de produits de votre forfait (${limits.max_products}). Veuillez mettre à niveau votre abonnement.`);
                    return;
                  }
                  setEditingProduct(null); 
                  setModalOpen(true); 
                }}
                className="h-9 font-medium"
              >
                <Plus size={18} className="mr-1.5" /> Nouveau produit
              </Button>
            </HasPermission>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : products.length === 0 && !search && !stockFilter ? (
          <EmptyProductState
            onCreate={() => {
              if (!canAddMore('max_products', totalProducts)) {
                toast.error(`Limite atteinte : Vous avez atteint la limite de produits de votre forfait (${limits.max_products}). Veuillez mettre à niveau votre abonnement.`);
                return;
              }
              setModalOpen(true);
            }}
            onImport={() => setImportModalOpen(true)}
          />
        ) : (
          <>
            {products.length > 0 && <ProductStats products={filteredProducts} totalProductsCount={totalProducts} />}
            <ProductFilters
              search={search}
              onSearchChange={setSearch}
              stockFilter={stockFilter}
              onStockFilterChange={setStockFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
            <ProductTable
              products={filteredProducts}
              onEdit={(p) => { setEditingProduct(p); setModalOpen(true); }}
              onDelete={setDeletingProduct}
              onReactivate={async (product) => {
                const res = await reactivateProduct(product.id, activeCompany.id);
                if (res.success) {
                  loadData();
                }
              }}
            />
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                <PageSizeSelector value={pageSize} onChange={(size) => { setPageSize(size); setPage(1); }} />
                <div className="text-sm text-gray-500">
                  {totalProducts} produit{totalProducts > 1 ? 's' : ''} au total
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm text-gray-500 mx-4">
                        Page {page} sur {totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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

      <DataImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        moduleName="products"
        onSuccess={loadData}
      />
    </div>
    </PermissionGuard>
  );
}