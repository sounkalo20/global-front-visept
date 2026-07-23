'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, Loader2, ArrowRight } from 'lucide-react';
import { salesApi } from '@/lib/api/sales';
import useCompanyStore from '@/store/companyStore';

export default function QuickHistoryModal({ open, onOpenChange }) {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && activeCompany) {
      loadHistory();
    }
  }, [open, activeCompany]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await salesApi.getAll(activeCompany.id, { limit: 10 });
      setSales(response.data.data.sales || []);
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History size={20} className="text-gray-500" />
            10 dernières ventes
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
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-medium">N° Vente</th>
                    <th className="px-4 py-3 font-medium">Heure</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Paiement</th>
                    <th className="px-4 py-3 font-medium text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{sale.sale_number}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(sale.sale_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {sale.client_first_name ? `${sale.client_first_name} ${sale.client_last_name || ''}` : sale.client_name || 'Passager'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize">
                        {sale.payment_method?.replace('_', ' ') || '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {parseInt(sale.total_amount).toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border">
          <p className="text-sm text-gray-600">
            Pour consulter l'historique complet et effectuer des recherches avancées, rendez-vous dans le module "Liste des ventes".
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="shrink-0 ml-4"
            onClick={() => {
              onOpenChange(false);
              router.push('/shop/sales');
            }}
          >
            Aller aux ventes <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
