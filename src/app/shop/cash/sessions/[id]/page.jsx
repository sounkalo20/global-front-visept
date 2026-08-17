'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, Download, Wallet, CreditCard, Banknote, Calendar } from 'lucide-react';
import useCompanyStore from '@/store/companyStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SessionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id;
  
  const { activeCompany } = useCompanyStore();
  const [session, setSession] = useState(null);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeCompany || !sessionId) return;
    
    const fetchSessionData = async () => {
      setIsLoading(true);
      try {
        // Obtenir la session spécifique (on filtre dans l'historique pour l'instant)
        const histRes = await api.get(`/cash/sessions?company_id=${activeCompany.id}`);
        const foundSession = histRes.data.data.find(s => s.id.toString() === sessionId);
        
        if (foundSession) {
          setSession(foundSession);
          // Obtenir les mouvements
          const movRes = await api.get(`/cash/sessions/${sessionId}/movements?company_id=${activeCompany.id}`);
          setMovements(movRes.data.data || []);
        } else {
          router.push('/shop/cash');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessionData();
  }, [activeCompany, sessionId, router]);

  if (isLoading) {
    return <LoadingScreen message="Chargement des détails de la session..." />;
  }

  if (!session) {
    return null;
  }

  const isClosed = session.status === 'closed';
  
  // Calculs par méthode de paiement
  const paymentMethodStats = movements.reduce((acc, mov) => {
    if (mov.type === 'sale_in') {
      acc[mov.payment_method] = (acc[mov.payment_method] || 0) + Number(mov.amount);
    }
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-600 dark:text-[#D1D5DB]">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-[#F9FAFB]">
              <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400" /> 
              Rapport Z - Session #{session.id}
            </h1>
            <p className="text-gray-500 dark:text-[#D1D5DB] text-sm mt-0.5">
              Caisse : <strong className="text-gray-900 dark:text-[#F9FAFB]">{session.register_name}</strong> | Caissier : <strong className="text-gray-900 dark:text-[#F9FAFB]">{session.cashier_first_name || session.first_name} {session.cashier_last_name || session.last_name}</strong>
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] text-gray-900 dark:text-[#F9FAFB] text-xs h-9">
          <Download className="mr-2 h-4 w-4" /> Imprimer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151]">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Wallet className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">Fond de caisse</p>
            <p className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB] mt-1">{parseFloat(session.opening_amount || 0).toLocaleString()} FCFA</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151]">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Banknote className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">Ventes en espèces</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{(paymentMethodStats['cash'] || 0).toLocaleString()} FCFA</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151]">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CreditCard className="h-8 w-8 text-purple-500 mb-2" />
            <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">Autres méthodes</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
              {(
                (paymentMethodStats['card'] || 0) + 
                (paymentMethodStats['mobile_money'] || 0) + 
                (paymentMethodStats['bank_transfer'] || 0)
              ).toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] ${!isClosed ? 'border-dashed' : ''}`}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className={`h-8 w-8 mb-2 ${isClosed ? 'text-gray-900 dark:text-[#F9FAFB]' : 'text-gray-400'}`} />
            <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">Total Espèces Attendu</p>
            <p className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB] mt-1">{parseFloat(session.expected_closing_amount || 0).toLocaleString()} FCFA</p>
          </CardContent>
        </Card>
      </div>

      {isClosed && (
        <Card className="bg-gray-50/80 dark:bg-[#1F2937]/50 border-gray-200 dark:border-[#374151]">
          <CardHeader className="pb-3 border-b border-gray-200 dark:border-[#374151]">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">Résumé de Clôture</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">Fermée le</p>
                <p className="font-semibold text-xs text-gray-900 dark:text-[#F9FAFB] mt-0.5">{format(new Date(session.closed_at), 'dd MMMM yyyy HH:mm', { locale: fr })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">Montant déclaré (Espèces)</p>
                <p className="font-semibold text-xs text-gray-900 dark:text-[#F9FAFB] mt-0.5">{parseFloat(session.actual_closing_amount || 0).toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">Écart constaté</p>
                <p className={`font-bold text-xs mt-0.5 ${Number(session.difference_amount) < 0 ? 'text-red-600 dark:text-red-400' : Number(session.difference_amount) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-[#D1D5DB]'}`}>
                  {parseFloat(session.difference_amount || 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
            {session.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#374151]">
                <p className="text-xs text-gray-500 dark:text-[#9CA3AF] mb-1">Notes de clôture / Justification :</p>
                <p className="text-xs bg-white dark:bg-[#111827] text-gray-900 dark:text-[#F9FAFB] p-3 rounded-xl border border-gray-200 dark:border-[#374151]">{session.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151]">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#374151]">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">Journal des Mouvements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/80 dark:bg-[#1F2937]/80 text-gray-500 dark:text-[#D1D5DB] uppercase text-[11px] border-b border-gray-200 dark:border-[#374151]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Heure</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Paiement</th>
                  <th className="px-4 py-3 text-right font-semibold">Montant</th>
                  <th className="px-4 py-3 font-semibold">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-[#9CA3AF] italic">
                      Aucun mouvement enregistré pour le moment.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/50 transition-colors">
                      <td className="px-4 py-3 text-gray-700 dark:text-[#D1D5DB]">{format(new Date(mov.created_at), 'HH:mm', { locale: fr })}</td>
                      <td className="px-4 py-3">
                        {mov.type === 'sale_in' ? (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-semibold">Vente</span>
                        ) : mov.type === 'refund_out' ? (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 rounded-full text-[10px] font-semibold">Remboursement</span>
                        ) : mov.type === 'deposit' ? (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-semibold">Dépôt</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-full text-[10px] font-semibold">Retrait</span>
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-700 dark:text-[#D1D5DB]">{mov.payment_method.replace('_', ' ')}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${mov.type.includes('out') || mov.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {(mov.type.includes('out') || mov.type === 'withdrawal' ? '-' : '+')}
                        {parseFloat(mov.amount).toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-[#9CA3AF] text-[11px]">
                        {mov.notes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
