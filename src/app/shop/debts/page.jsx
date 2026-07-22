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

export default function DebtsPage() {
  const { debts, stats, isLoading, fetchDebts, fetchStats } = useDebtStore();
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [overdue, setOverdue] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const loadData = useCallback(() => {
    if (activeCompany) {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (overdue) params.overdue = overdue;
      params.sort_by = sortBy;
      fetchDebts(activeCompany.id, params);
      fetchStats(activeCompany.id);
    }
  }, [activeCompany, search, status, overdue, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // DEBUG : log pour vérifier les données
  useEffect(() => {
    console.log('debts:', debts, 'isLoading:', isLoading, 'totalDebts:', debts?.length);
  }, [debts, isLoading]);

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
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        overdue={overdue}
        onOverdueChange={setOverdue}
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
        <DebtTable debts={debts} />
      )}
    </div>
  );
}