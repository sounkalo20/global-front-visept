'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcw, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { returnService } from '@/lib/api/returns';
import useCompanyStore from '@/store/companyStore';
import { motion } from 'framer-motion';
import ReturnDetailModal from '@/components/sales/ReturnDetailModal';

export default function ReturnsPage() {
  const { activeCompany } = useCompanyStore();
  const router = useRouter();
  const [returns, setReturns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReturnId, setSelectedReturnId] = useState(null);

  const fetchReturns = async () => {
    if (!activeCompany) return;
    setIsLoading(true);
    try {
      const response = await returnService.getReturns({ company_id: activeCompany.id });
      setReturns(response.data.returns || []);
    } catch (error) {
      console.error("Erreur de chargement des retours", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [activeCompany]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Retours Produits</h1>
          <p className="text-gray-500 text-sm">Historique des produits retournés</p>
        </div>
        <Button onClick={fetchReturns} variant="outline" size="sm">
          <RefreshCcw size={16} className="mr-2" /> Actualiser
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : returns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PackageSearch size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Aucun retour enregistré</h3>
          <p className="text-gray-500 max-w-sm text-center mt-2">
            Les retours de produits apparaîtront ici. Vous pouvez créer un retour depuis la page de détails d'une vente.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-3 text-left">N° Retour</th>
                <th className="px-4 py-3 text-left">N° Vente (Original)</th>
                <th className="px-4 py-3 text-right">Montant Remboursé</th>
                <th className="px-4 py-3 text-left">Créé par</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returns.map((ret, i) => (
                <motion.tr
                  key={ret.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm text-brand-600">{ret.return_number}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {ret.sale_number}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    -{parseInt(ret.total_amount_returned).toLocaleString()} F
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {ret.created_by_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(ret.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedReturnId(ret.id)}
                      className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                    >
                      Voir détail
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ReturnDetailModal 
        returnId={selectedReturnId} 
        open={!!selectedReturnId} 
        onOpenChange={(open) => !open && setSelectedReturnId(null)} 
      />
    </div>
  );
}
