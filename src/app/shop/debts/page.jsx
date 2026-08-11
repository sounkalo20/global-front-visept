'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DebtStats from '@/components/debts/DebtStats';
import DebtFilters from '@/components/debts/DebtFilters';
import DebtTable from '@/components/debts/DebtTable';
import EmptyDebtState from '@/components/debts/EmptyDebtState';
import ExportDebtsPDFDialog from '@/components/debts/ExportDebtsPDFDialog';
import useDebtStore from '@/store/debtStore';
import useCompanyStore from '@/store/companyStore';
import {
  Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import PageSizeSelector, { getStoredPageSize } from '@/components/ui/PageSizeSelector';

export default function DebtsPage() {
  const { debts, stats, totalPages, isLoading, fetchDebts, fetchStats } = useDebtStore();
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [overdue, setOverdue] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getStoredPageSize(20));

  const loadData = useCallback(() => {
    if (activeCompany) {
      const params = { sort_by: sortBy, page, limit: pageSize };
      if (search) params.search = search;
      if (status) params.status = status;
      if (overdue) params.overdue = overdue;
      fetchDebts(activeCompany.id, params);
      fetchStats(activeCompany.id);
    }
  }, [activeCompany, search, status, overdue, sortBy, page, pageSize]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!activeCompany) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyDebtState onCreate={() => { }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dettes clients</h1>
          <p className="text-gray-500 text-sm">Suivi des ventes à crédit</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportDebtsPDFDialog />
          <Button onClick={() => router.push('/shop/debts/new')}>
            <Plus size={18} className="mr-2" /> Nouvelle vente à crédit
          </Button>
        </div>
      </div>

      <DebtStats stats={stats} />

      <DebtFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(1); }}
        overdue={overdue}
        onOverdueChange={(v) => { setOverdue(v); setPage(1); }}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : !debts || debts.length === 0 ? (
        <EmptyDebtState onCreate={() => router.push('/shop/debts/new')} />
      ) : (
        <>
          <DebtTable debts={debts} />
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
    </div>
  );
}
