'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SaleDetail from '@/components/sales/SaleDetail';
import CancelSaleDialog from '@/components/sales/CancelSaleDialog';
import useSaleStore from '@/store/saleStore';
import useCompanyStore from '@/store/companyStore';

export default function SaleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentSale, fetchSaleById, isLoading } = useSaleStore();
  const { activeCompany } = useCompanyStore();
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    if (activeCompany) fetchSaleById(id, activeCompany.id);
  }, [id, activeCompany]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SaleDetail
        sale={currentSale}
        onBack={() => router.push('/shop/sales')}
        onCancel={() => setShowCancel(true)}
        editLink={'/shop/sales/'}
      />
      <CancelSaleDialog
        sale={currentSale}
        open={showCancel}
        onOpenChange={setShowCancel}
        onSuccess={() => fetchSaleById(id, activeCompany.id)}
      />
    </div>
  );
}