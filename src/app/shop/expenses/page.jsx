'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Folder, CreditCard, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExpenseStats from '@/components/expenses/ExpenseStats';
import ExpenseFilters from '@/components/expenses/ExpenseFilters';
import ExpenseTable from '@/components/expenses/ExpenseTable';
import ExpenseModal from '@/components/expenses/ExpenseModal';
import ExpenseDetailModal from '@/components/expenses/ExpenseDetailModal';
import DeleteExpenseDialog from '@/components/expenses/DeleteExpenseDialog';
import EmptyExpenseState from '@/components/expenses/EmptyExpenseState';
import ExportExpensesPDFDialog from '@/components/expenses/ExportExpensesPDFDialog';
import BulkActionBar from '@/components/common/BulkActionBar';
import BulkConfirmModal from '@/components/common/BulkConfirmModal';
import BulkResultModal from '@/components/common/BulkResultModal';
import ColumnSelector from '@/components/common/ColumnSelector';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { EXPENSES_COLUMNS } from '@/config/tableColumns';
import useExpenseStore from '@/store/expenseStore';
import useCompanyStore from '@/store/companyStore';
import { toast } from 'sonner';
import {
  Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import PageSizeSelector, { getStoredPageSize } from '@/components/ui/PageSizeSelector';

const paymentMethodOptions = [
  { value: 'cash', label: 'Espèces (Cash)' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'check', label: 'Chèque' },
  { value: 'other', label: 'Autre mode' },
];

export default function ExpensesPage() {
  const { expenses, stats, categories, isLoading, fetchExpenses, fetchStats, fetchCategories, totalPages, executeBulkAction } = useExpenseStore();
  const { activeCompany } = useCompanyStore();

  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);

  const [search, setSearch] = useState(() => searchParams?.get('search') || '');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('expense_date');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getStoredPageSize(20));

  // Synchroniser la recherche si l'URL change
  useEffect(() => {
    const urlQuery = searchParams?.get('search');
    if (urlQuery !== null && urlQuery !== undefined) {
      setSearch(urlQuery);
      setPage(1);
    }
  }, [searchParams]);

  // Préférences de colonnes
  const { visibleColumns, toggleColumn, resetToDefaults, hiddenCount } =
    useColumnPreferences('expenses', EXPENSES_COLUMNS, activeCompany?.id);

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
      if (category) params.category = category;
      if (paymentMethod) params.payment_method = paymentMethod;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      fetchExpenses(activeCompany.id, params);
      fetchStats(activeCompany.id);
      fetchCategories(activeCompany.id);
    }
  }, [activeCompany, search, category, paymentMethod, startDate, endDate, sortBy, page, pageSize, fetchExpenses, fetchStats, fetchCategories]);

  useEffect(() => { loadData(); }, [loadData]);

  const bulkSelection = useBulkSelection(expenses);

  const handleExecuteBulkAction = async ({ value, reason } = {}) => {
    if (!activeCompany || bulkSelection.selectedCount === 0) return;

    setIsBulkExecuting(true);
    const action = bulkConfirm.action;
    const params = {};

    if (action === 'change_category') {
      params.category = value;
    } else if (action === 'change_payment_method') {
      params.payment_method = value;
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
      if (response.data?.skipped_count > 0 || response.data?.failed_count > 0) {
        setBulkResult({ open: true, result: response.data });
      } else {
        toast.success(response.message || `${bulkSelection.selectedCount} dépense(s) traitée(s).`);
      }
    } else {
      toast.error(response.message);
    }
  };

  const categoryOptions = useMemo(() => {
    return (categories || []).map((cat) => ({
      value: cat.value || cat.id || cat,
      label: cat.label || cat.name || cat,
    }));
  }, [categories]);

  const bulkPrimaryActions = [
    {
      label: 'Changer catégorie',
      icon: Folder,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'change_category',
          actionType: 'change_category',
          title: 'Changer la catégorie des dépenses',
          description: 'Attribuez une catégorie commune à toutes les dépenses sélectionnées.',
          options: categoryOptions,
          optionsLabel: 'Nouvelle catégorie de dépense',
          isDestructive: false,
        });
      },
    },
    {
      label: 'Changer moyen de paiement',
      icon: CreditCard,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'change_payment_method',
          actionType: 'change_status',
          title: 'Modifier le moyen de paiement',
          description: 'Attribuez un moyen de paiement commun à toutes les dépenses sélectionnées.',
          options: paymentMethodOptions,
          optionsLabel: 'Nouveau mode de paiement',
          isDestructive: false,
        });
      },
    },
  ];

  const bulkSecondaryActions = [
    {
      label: 'Supprimer les dépenses',
      icon: Trash2,
      danger: true,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'delete',
          actionType: 'delete',
          title: 'Supprimer les dépenses sélectionnées',
          description: 'Ces dépenses seront archivées et déduites de vos rapports de dépenses.',
          isDestructive: true,
          confirmLabel: 'Supprimer les dépenses',
        });
      },
    },
  ];

  if (!activeCompany) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyExpenseState onCreate={() => {}} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB]">Dépenses</h1>
          <p className="text-gray-500 dark:text-[#D1D5DB] text-sm">Suivi et gestion de vos dépenses ({expenses.length})</p>
        </div>
        <div className="flex items-center gap-3">
          <ColumnSelector
            columnsDef={EXPENSES_COLUMNS}
            visibleColumns={visibleColumns}
            onToggle={toggleColumn}
            onReset={resetToDefaults}
            hiddenCount={hiddenCount}
          />
          <ExportExpensesPDFDialog />
          <Button onClick={() => { setEditingExpense(null); setModalOpen(true); }} className="bg-brand-600 hover:bg-brand-700 text-white">
            <Plus size={18} className="mr-2" /> Nouvelle dépense
          </Button>
        </div>
      </div>

      <ExpenseStats stats={stats} />

      <ExpenseFilters
        search={search} onSearchChange={setSearch}
        category={category} onCategoryChange={setCategory}
        paymentMethod={paymentMethod} onPaymentMethodChange={setPaymentMethod}
        startDate={startDate} onStartDateChange={setStartDate}
        endDate={endDate} onEndDateChange={setEndDate}
        sortBy={sortBy} onSortByChange={setSortBy}
        categories={categories}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : expenses.length === 0 && !search && !category ? (
        <EmptyExpenseState onCreate={() => setModalOpen(true)} />
      ) : (
        <>
          <ExpenseTable
            expenses={expenses}
            onView={setViewingExpense}
            onEdit={(e) => { setEditingExpense(e); setModalOpen(true); }}
            onDelete={setDeletingExpense}
            selectedIds={bulkSelection.selectedIds}
            onToggleSelect={bulkSelection.toggleSelect}
            onToggleSelectAll={bulkSelection.toggleSelectPage}
            isAllPageSelected={bulkSelection.isAllPageSelected}
            isSomePageSelected={bulkSelection.isSomePageSelected}
            isSelected={bulkSelection.isSelected}
            visibleColumns={visibleColumns}
          />
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <PageSizeSelector value={pageSize} onChange={(size) => { setPageSize(size); setPage(1); }} />
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
                    <span className="text-sm text-gray-500 dark:text-[#D1D5DB] mx-4">Page {page} sur {totalPages}</span>
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

      <BulkActionBar
        selectedCount={bulkSelection.selectedCount}
        totalCount={expenses.length}
        isAllPageSelected={bulkSelection.isAllPageSelected}
        onClearSelection={bulkSelection.clearSelection}
        primaryActions={bulkPrimaryActions}
        secondaryActions={bulkSecondaryActions}
        itemName="dépense"
        itemPlural="dépenses"
      />

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
        options={bulkConfirm.actionType === 'change_category' ? categoryOptions : (bulkConfirm.options || [])}
        optionsLabel={bulkConfirm.optionsLabel}
        isLoading={isBulkExecuting}
      />

      <BulkResultModal
        isOpen={bulkResult.open}
        onClose={() => setBulkResult({ open: false, result: null })}
        result={bulkResult.result}
        title="Résultat de l'action sur les dépenses"
      />

      <ExpenseModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingExpense(null); }}
        expense={editingExpense}
        categories={categories}
        onSuccess={loadData}
      />

      <ExpenseDetailModal
        open={!!viewingExpense}
        onOpenChange={(open) => { if (!open) setViewingExpense(null); }}
        expense={viewingExpense}
      />

      <DeleteExpenseDialog
        open={!!deletingExpense}
        onOpenChange={(open) => { if (!open) setDeletingExpense(null); }}
        expense={deletingExpense}
        onSuccess={loadData}
      />
    </div>
  );
}