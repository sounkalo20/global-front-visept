'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SaleDetail from '@/components/sales/SaleDetail';
import CancelSaleDialog from '@/components/sales/CancelSaleDialog';
import useSaleStore from '@/store/saleStore';
import useCompanyStore from '@/store/companyStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ReceiptPreviewModal from '@/components/sales/receipt/ReceiptPreviewModal';

export default function SaleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentSale, fetchSaleById, isLoading } = useSaleStore();
  const { activeCompany } = useCompanyStore();
  const [showCancel, setShowCancel] = useState(false);
  const [printingSale, setPrintingSale] = useState(null);

  useEffect(() => {
    if (activeCompany) fetchSaleById(id, activeCompany.id);
  }, [id, activeCompany]);

  if (isLoading) {
    return <LoadingScreen variant="inline" message="Chargement de la vente" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SaleDetail
        sale={currentSale}
        onBack={() => router.push('/restaurant/sales')}
        onCancel={() => setShowCancel(true)}
        onPrintReceipt={(sale) => setPrintingSale(sale)}
        editLink={'/restaurant/sales/'}
        variant="restaurant"
      />
      
      {printingSale && (
        <ReceiptPreviewModal 
          sale={printingSale} 
          open={!!printingSale} 
          onOpenChange={(open) => !open && setPrintingSale(null)} 
        />
      )}

      <CancelSaleDialog
        sale={currentSale}
        open={showCancel}
        onOpenChange={setShowCancel}
        onSuccess={() => fetchSaleById(id, activeCompany.id)}
      />
    </div>
  );
}