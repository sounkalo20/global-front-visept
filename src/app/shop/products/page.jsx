'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, CheckCircle2, EyeOff, Folder, Trash2, Layers, Tag } from 'lucide-react';
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
import BulkActionBar from '@/components/common/BulkActionBar';
import BulkConfirmModal from '@/components/common/BulkConfirmModal';
import BulkResultModal from '@/components/common/BulkResultModal';
import { useBulkSelection } from '@/hooks/useBulkSelection';
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
  const { products, totalProducts, totalPages, isLoading, fetchProducts, reactivateProduct, executeBulkAction } = useProductStore();
  const { activeCompany } = useCompanyStore();
  const { categories, fetchCategories } = useCategoryStore();
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

  // Modals pour les Bulk Actions
  const [bulkConfirm, setBulkConfirm] = useState({
    open: false,
    action: null,
    title: '',
    description: '',
    isDestructive: false,
    actionType: 'default',
    warningMessage: null,
    options: [],
    optionsLabel: '',
  });
  const [isBulkExecuting, setIsBulkExecuting] = useState(false);
  const [bulkResult, setBulkResult] = useState({ open: false, result: null });

  const loadData = useCallback(() => {
    if (activeCompany) {
      const params = { sort_by: sortBy, page, limit: pageSize };
      if (search) params.search = search;
      if (stockFilter === 'low') params.low_stock = 'true';
      fetchProducts(activeCompany.id, params);
      fetchCategories(activeCompany.id);
    }
  }, [activeCompany, search, stockFilter, sortBy, page, pageSize, fetchProducts, fetchCategories]);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtrage frontend complémentaire
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (statusFilter === 'active' && product.is_active === 0) return false;
      if (statusFilter === 'inactive' && product.is_active === 1) return false;
      if (stockFilter === 'out' && product.current_stock > 0) return false;
      return true;
    });
  }, [products, statusFilter, stockFilter]);

  // Hook de sélection en masse
  const bulkSelection = useBulkSelection(filteredProducts);

  // Exécution de l'action en masse
  const handleExecuteBulkAction = async ({ value, reason } = {}) => {
    if (!activeCompany || bulkSelection.selectedCount === 0) return;

    setIsBulkExecuting(true);
    const action = bulkConfirm.action;
    const params = {};

    if (action === 'change_category') {
      params.category_id = (value && value !== 'none') ? parseInt(value) : null;
    } else if (action === 'toggle_stock_management') {
      params.manage_stock = bulkConfirm.manageStockValue;
    } else if (action === 'delete') {
      params.reason = reason;
    }

    const response = await executeBulkAction(activeCompany.id, {
      ids: bulkSelection.selectedIdsArray,
      action,
      params,
    });

    setIsBulkExecuting(false);
    setBulkConfirm((prev) => ({ ...prev, open: false }));

    if (response.success) {
      bulkSelection.clearSelection();
      loadData();
      // Si des éléments ont été ignorés ou en échec, afficher la modale détaillée
      if (response.data?.skipped_count > 0 || response.data?.failed_count > 0) {
        setBulkResult({ open: true, result: response.data });
      } else {
        toast.success(response.message || `${bulkSelection.selectedCount} produit(s) traité(s).`);
      }
    } else {
      toast.error(response.message);
    }
  };

  // Configuration des actions de la Bulk Action Bar
  const categoryOptions = useMemo(() => {
    return [
      { value: 'none', label: 'Aucune catégorie (Non catégorisé)' },
      ...categories.map((c) => ({ value: c.id.toString(), label: c.name })),
    ];
  }, [categories]);

  const bulkPrimaryActions = [
    {
      label: 'Activer',
      icon: CheckCircle2,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'activate',
          actionType: 'activate',
          title: 'Activer les produits sélectionnés',
          description: 'Ces produits redeviendront visibles à la caisse et dans le catalogue actif.',
          isDestructive: false,
        });
      },
    },
    {
      label: 'Désactiver',
      icon: EyeOff,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'deactivate',
          actionType: 'deactivate',
          title: 'Désactiver les produits sélectionnés',
          description: 'Ces produits ne seront plus proposés à la vente directe mais conserveront leur historique.',
          isDestructive: false,
          warningMessage: 'Les produits inactifs peuvent être réactivés à tout moment.',
        });
      },
    },
    {
      label: 'Changer catégorie',
      icon: Folder,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'change_category',
          actionType: 'change_category',
          title: 'Définir une catégorie commune',
          description: 'Attribuez une même catégorie à tous les produits sélectionnés.',
          options: categoryOptions,
          optionsLabel: 'Nouvelle catégorie',
          isDestructive: false,
        });
      },
    },
  ];

  const bulkSecondaryActions = [
    {
      label: 'Activer gestion de stock',
      icon: Layers,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'toggle_stock_management',
          manageStockValue: true,
          title: 'Activer le suivi de stock',
          description: 'Le stock sera décompté automatiquement lors des ventes pour ces produits.',
          isDestructive: false,
        });
      },
    },
    {
      label: 'Désactiver gestion de stock',
      icon: Layers,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'toggle_stock_management',
          manageStockValue: false,
          title: 'Désactiver le suivi de stock',
          description: 'Les ventes de ces produits ne vérifieront plus le niveau de stock disponible.',
          isDestructive: false,
        });
      },
    },
    {
      label: 'Supprimer les produits éligibles',
      icon: Trash2,
      danger: true,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'delete',
          actionType: 'delete',
          title: 'Supprimer les produits sélectionnés',
          description: 'Les produits sans historique de vente ou achat seront supprimés.',
          isDestructive: true,
          confirmLabel: 'Supprimer',
          warningMessage: 'Règle de sécurité : Tout produit déjà rattaché à une vente, commande fournisseur ou recette sera automatiquement ignoré et conservé.',
        });
      },
    },
  ];

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB]">Produits</h1>
            <p className="text-gray-500 dark:text-[#D1D5DB] mt-1">{totalProducts} produit{totalProducts > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <DataExportButton moduleName="products" />
            <ExportProductsPDFButton />
            
            <HasPermission required="products.create">
              <Button
                variant="outline"
                onClick={() => setImportModalOpen(true)}
                className="border-brand-200 dark:border-[#374151] text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-[#1F2937] h-9 font-medium"
              >
                <Upload size={16} className="mr-1.5 text-brand-600 dark:text-brand-400" /> Importer
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
                className="h-9 font-medium bg-brand-600 hover:bg-brand-700 text-white"
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
              selectedIds={bulkSelection.selectedIds}
              onToggleSelect={bulkSelection.toggleSelect}
              onToggleSelectAll={bulkSelection.toggleSelectPage}
              isAllPageSelected={bulkSelection.isAllPageSelected}
              isSomePageSelected={bulkSelection.isSomePageSelected}
              isSelected={bulkSelection.isSelected}
            />
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
                <PageSizeSelector value={pageSize} onChange={(size) => { setPageSize(size); setPage(1); }} />
                <div className="text-sm text-gray-500 dark:text-[#D1D5DB]">
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
                      <span className="text-sm text-gray-500 dark:text-[#D1D5DB] mx-4">
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

      {/* Barre d'actions en masse flottante */}
      <BulkActionBar
        selectedCount={bulkSelection.selectedCount}
        totalCount={totalProducts}
        isAllPageSelected={bulkSelection.isAllPageSelected}
        onClearSelection={bulkSelection.clearSelection}
        primaryActions={bulkPrimaryActions}
        secondaryActions={bulkSecondaryActions}
        itemName="produit"
        itemPlural="produits"
      />

      {/* Modale de confirmation Bulk */}
      <BulkConfirmModal
        isOpen={bulkConfirm.open}
        onClose={() => setBulkConfirm((prev) => ({ ...prev, open: false }))}
        onConfirm={handleExecuteBulkAction}
        title={bulkConfirm.title}
        description={bulkConfirm.description}
        count={bulkSelection.selectedCount}
        actionType={bulkConfirm.actionType}
        isDestructive={bulkConfirm.isDestructive}
        confirmLabel={bulkConfirm.confirmLabel || 'Confirmer'}
        warningMessage={bulkConfirm.warningMessage}
        options={bulkConfirm.options}
        optionsLabel={bulkConfirm.optionsLabel}
        isLoading={isBulkExecuting}
      />

      {/* Modale de rapport post-exécution */}
      <BulkResultModal
        isOpen={bulkResult.open}
        onClose={() => setBulkResult({ open: false, result: null })}
        result={bulkResult.result}
        title="Résultat de l'action sur les produits"
      />

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