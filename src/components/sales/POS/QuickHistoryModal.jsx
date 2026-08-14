'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, Loader2, ArrowRight, Eye } from 'lucide-react';
import { salesApi } from '@/lib/api/sales';
import useCompanyStore from '@/store/companyStore';
import useCashStore from '@/store/cashStore';
import useSaleStore from '@/store/saleStore';
import usePermissionsStore from '@/store/permissionsStore';
import ReceiptPreviewModal from '@/components/sales/receipt/ReceiptPreviewModal';

export default function QuickHistoryModal({ open, onOpenChange }) {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { activeSession } = useCashStore();
  const { fetchSaleById } = useSaleStore();
  const { roleName, isSystemRole } = usePermissionsStore();
  
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const isCashier = activeCompany?.my_role === 'cashier' || (isSystemRole && roleName === 'Caissier');

  useEffect(() => {
    if (open && activeCompany) {
      loadHistory();
    }
  }, [open, activeCompany]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const params = { limit: 10 };
      if (isCashier && activeSession) {
        params.cash_session_id = activeSession.id;
      }
      const response = await salesApi.getAll(activeCompany.id, params);
      setSales(response.data.data.sales || []);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (sale) => {
    try {
      const fullSale = await fetchSaleById(sale.id, activeCompany.id);
      setSelectedSale(fullSale);
    } catch (error) {
      console.error("Failed to fetch full sale", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History size={20} className="text-gray-500" />
              {isCashier ? "Ventes de la session actuelle" : "10 dernières ventes"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune vente trouvée.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#374151]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-[#1F2937] text-gray-500 dark:text-[#D1D5DB] border-b border-gray-200 dark:border-[#374151]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">N° Vente</th>
                      <th className="px-4 py-3 font-semibold">Heure</th>
                      <th className="px-4 py-3 font-semibold">Client</th>
                      <th className="px-4 py-3 font-semibold">Paiement</th>
                      <th className="px-4 py-3 font-semibold text-right">Montant</th>
                      <th className="px-4 py-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#374151]">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1F2937]/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-[#F9FAFB]">{sale.sale_number}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-[#9CA3AF]">
                          {new Date(sale.sale_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-[#D1D5DB]">
                          {sale.client_first_name ? `${sale.client_first_name} ${sale.client_last_name || ''}` : sale.client_name || 'Passager'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-[#9CA3AF] capitalize">
                          {sale.payment_method?.replace('_', ' ') || '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-[#F9FAFB]">
                          {parseInt(sale.total_amount).toLocaleString()} FCFA
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                            onClick={() => handleViewDetail(sale)}
                          >
                            <Eye size={16} className="mr-1.5" />
                            Détail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!isCashier && (
            <div className="bg-gray-50 dark:bg-[#1F2937]/60 p-4 rounded-xl flex items-center justify-between border border-gray-200 dark:border-[#374151]">
              <p className="text-sm text-gray-600 dark:text-[#D1D5DB]">
                Pour consulter l'historique complet et effectuer des recherches avancées, rendez-vous dans le module "Liste des ventes".
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="shrink-0 ml-4 border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#374151]"
                onClick={() => {
                  onOpenChange(false);
                  router.push('/shop/sales');
                }}
              >
                Aller aux ventes <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedSale && (
        <ReceiptPreviewModal 
          sale={selectedSale} 
          open={!!selectedSale} 
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedSale(null);
          }} 
        />
      )}
    </>
  );
}
