'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SalesStats from '@/components/sales/SalesStats';
import SalesFilters from '@/components/sales/SalesFilters';
import SalesTable from '@/components/sales/SalesTable';
import ExportSalesPDFDialog from '@/components/sales/ExportSalesPDFDialog';
import useSaleStore from '@/store/saleStore';
import useCompanyStore from '@/store/companyStore';

export default function SalesPage() {
  const { sales, stats, isLoading, fetchSales, fetchStats } = useSaleStore();
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [status, setStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (activeCompany) {
      const params = { search, payment_status: paymentStatus, status };
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.start_date = today;
        params.end_date = today;
      }
      fetchSales(activeCompany.id, params);
      fetchStats(activeCompany.id);
    }
  }, [activeCompany, search, paymentStatus, status, dateFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ventes</h1>
          <p className="text-gray-500 text-sm">Historique et gestion des ventes</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportSalesPDFDialog />
          <Button onClick={() => router.push('/shop/sales/new')} size="lg">
            <Plus size={20} className="mr-2" /> Nouvelle vente
          </Button>
        </div>
      </div>

      <SalesStats stats={stats} />

      <SalesFilters
        search={search} onSearchChange={setSearch}
        paymentStatus={paymentStatus} onPaymentStatusChange={setPaymentStatus}
        status={status} onStatusChange={setStatus}
        dateFilter={dateFilter} onDateFilterChange={setDateFilter}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : (
        <SalesTable sales={sales} />
      )}
    </div>
  );
}