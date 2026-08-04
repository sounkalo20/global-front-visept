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
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-brand-600" /> 
              Rapport Z - Session #{session.id}
            </h1>
            <p className="text-gray-500">
              Caisse : {session.register_name} | Caissier : {session.cashier_first_name} {session.cashier_last_name}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="bg-white">
          <Download className="mr-2 h-4 w-4" /> Imprimer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Wallet className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm text-gray-500">Fond de caisse</p>
            <p className="text-xl font-bold">{parseFloat(session.opening_amount).toLocaleString()} FCFA</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Banknote className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-gray-500">Ventes en espèces</p>
            <p className="text-xl font-bold">{(paymentMethodStats['cash'] || 0).toLocaleString()} FCFA</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <CreditCard className="h-8 w-8 text-purple-500 mb-2" />
            <p className="text-sm text-gray-500">Autres méthodes</p>
            <p className="text-xl font-bold">
              {(
                (paymentMethodStats['card'] || 0) + 
                (paymentMethodStats['mobile_money'] || 0) + 
                (paymentMethodStats['bank_transfer'] || 0)
              ).toLocaleString()} FCFA
            </p>
          </CardContent>
        </Card>

        <Card className={!isClosed ? 'border-dashed' : ''}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Calendar className={`h-8 w-8 mb-2 ${isClosed ? 'text-gray-900' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-500">Total Espèces Attendu</p>
            <p className="text-xl font-bold">{parseFloat(session.expected_closing_amount).toLocaleString()} FCFA</p>
          </CardContent>
        </Card>
      </div>

      {isClosed && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Résumé de Clôture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Fermée le</p>
                <p className="font-medium">{format(new Date(session.closed_at), 'dd MMMM yyyy HH:mm', { locale: fr })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Montant déclaré (Espèces)</p>
                <p className="font-medium">{parseFloat(session.actual_closing_amount).toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Écart constaté</p>
                <p className={`font-medium ${Number(session.difference_amount) < 0 ? 'text-red-600' : Number(session.difference_amount) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {parseFloat(session.difference_amount).toLocaleString()} FCFA
                </p>
              </div>
            </div>
            {session.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Notes de clôture / Justification :</p>
                <p className="text-sm bg-white p-3 rounded border">{session.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Journal des Mouvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Heure</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Paiement</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 rounded-tr-lg">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500 italic">
                      Aucun mouvement enregistré pour le moment.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">{format(new Date(mov.created_at), 'HH:mm', { locale: fr })}</td>
                      <td className="px-4 py-3">
                        {mov.type === 'sale_in' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Vente</span>
                        ) : mov.type === 'refund_out' ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Remboursement</span>
                        ) : mov.type === 'deposit' ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Dépôt</span>
                        ) : (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Retrait</span>
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize">{mov.payment_method.replace('_', ' ')}</td>
                      <td className={`px-4 py-3 text-right font-medium ${mov.type.includes('out') || mov.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                        {(mov.type.includes('out') || mov.type === 'withdrawal' ? '-' : '+')}
                        {parseFloat(mov.amount).toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
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
