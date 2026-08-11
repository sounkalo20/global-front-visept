'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExpenseStats from '@/components/expenses/ExpenseStats';
import ExpenseFilters from '@/components/expenses/ExpenseFilters';
import ExpenseTable from '@/components/expenses/ExpenseTable';
import ExpenseModal from '@/components/expenses/ExpenseModal';
import ExpenseDetailModal from '@/components/expenses/ExpenseDetailModal';
import DeleteExpenseDialog from '@/components/expenses/DeleteExpenseDialog';
import EmptyExpenseState from '@/components/expenses/EmptyExpenseState';
import ExportExpensesPDFDialog from '@/components/expenses/ExportExpensesPDFDialog';
import useExpenseStore from '@/store/expenseStore';
import useCompanyStore from '@/store/companyStore';
import {
  Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import PageSizeSelector, { getStoredPageSize } from '@/components/ui/PageSizeSelector';

export default function ExpensesPage() {
  const { expenses, stats, categories, isLoading, fetchExpenses, fetchStats, fetchCategories, totalPages } = useExpenseStore();
  const { activeCompany } = useCompanyStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('expense_date');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getStoredPageSize(20));

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
  }, [activeCompany, search, category, paymentMethod, startDate, endDate, sortBy, page, pageSize]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!activeCompany) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyExpenseState onCreate={() => {}} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dépenses</h1>
          <p className="text-gray-500 text-sm">Suivi et gestion de vos dépenses</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportExpensesPDFDialog />
          <Button onClick={() => { setEditingExpense(null); setModalOpen(true); }}>
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
                    <span className="text-sm text-gray-500 mx-4">Page {page} sur {totalPages}</span>
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

      <ExpenseModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingExpense(null); }}
        expense={editingExpense}
        categories={categories}
        onSuccess={loadData}
      />

      <ExpenseDetailModal
        expense={viewingExpense}
        open={!!viewingExpense}
        onOpenChange={() => setViewingExpense(null)}
      />

      <DeleteExpenseDialog
        expense={deletingExpense}
        open={!!deletingExpense}
        onOpenChange={(open) => { if (!open) setDeletingExpense(null); }}
        onSuccess={loadData}
      />
    </div>
  );
}