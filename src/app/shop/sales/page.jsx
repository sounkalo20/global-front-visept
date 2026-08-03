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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useCompanyStore from '@/store/companyStore';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';

export default function SalesPage() {
  const { sales, stats, totalPages, isLoading, fetchSales, fetchStats } = useSaleStore();
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [status, setStatus] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (activeCompany) {
      const params = { search, payment_status: paymentStatus, status, page };
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.start_date = today;
        params.end_date = today;
      }
      fetchSales(activeCompany.id, params);
      fetchStats(activeCompany.id);
    }
  }, [activeCompany, search, paymentStatus, status, dateFilter, page]);

  return (
    <PermissionGuard requiredPermission="sales.view">
      <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ventes</h1>
          <p className="text-gray-500 text-sm">Historique et gestion des ventes</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportSalesPDFDialog />
          <HasPermission required="sales.create">
            <Button onClick={() => router.push('/shop/sales/new')} size="lg">
              <Plus size={20} className="mr-2" /> Nouvelle vente
            </Button>
          </HasPermission>
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
        <>
          <SalesTable sales={sales} />
          {totalPages > 1 && (
            <div className="mt-6">
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
    </div>
    </PermissionGuard>
  );
}