'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet, LogIn, LogOut, Clock, Plus, LayoutDashboard, Receipt } from 'lucide-react';
import useCompanyStore from '@/store/companyStore';
import useCashStore from '@/store/cashStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RegisterAssignmentModal from '@/components/cash/RegisterAssignmentModal';
import { Users } from 'lucide-react';

export default function CashManagementPage() {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { 
    registers, fetchRegisters, createRegister,
    activeSession, fetchActiveSession, openSession, closeSession,
    sessionHistory, fetchSessionHistory,
    isLoading 
  } = useCashStore();

  const [openingAmount, setOpeningAmount] = useState('');
  const [selectedRegisterId, setSelectedRegisterId] = useState('');
  const [actualClosingAmount, setActualClosingAmount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  
  const [newRegisterName, setNewRegisterName] = useState('');
  const [isCreatingRegister, setIsCreatingRegister] = useState(false);
  
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedRegisterForAssignment, setSelectedRegisterForAssignment] = useState(null);

  useEffect(() => {
    if (activeCompany) {
      fetchRegisters(activeCompany.id);
      fetchActiveSession(activeCompany.id);
      fetchSessionHistory(activeCompany.id);
    }
  }, [activeCompany]);

  if (isLoading && !registers.length) {
    return <LoadingScreen message="Chargement de la caisse..." />;
  }

  const handleOpenSession = async (e) => {
    e.preventDefault();
    if (!selectedRegisterId || openingAmount === '') return;
    try {
      await openSession({
        company_id: activeCompany.id,
        cash_register_id: selectedRegisterId,
        opening_amount: parseFloat(openingAmount)
      });
      toast.success("Caisse ouverte avec succès !");
      setOpeningAmount('');
      setSelectedRegisterId('');
    } catch (error) {
      // Error handled in store
    }
  };

  const handleCloseSession = async (e) => {
    e.preventDefault();
    if (actualClosingAmount === '') return;
    try {
      const res = await closeSession(activeSession.id, {
        company_id: activeCompany.id,
        actual_closing_amount: parseFloat(actualClosingAmount),
        notes: closingNotes
      });
      toast.success(`Caisse clôturée. Ecart constaté: ${res.difference_amount} FCFA`);
      setActualClosingAmount('');
      setClosingNotes('');
      fetchSessionHistory(activeCompany.id);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleCreateRegister = async (e) => {
    e.preventDefault();
    if (!newRegisterName) return;
    try {
      await createRegister(activeCompany.id, newRegisterName);
      toast.success("Caisse créée avec succès !");
      setNewRegisterName('');
      setIsCreatingRegister(false);
    } catch (error) {
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" /> Gestion de Caisse
          </h1>
          <p className="text-gray-500">Ouverture, clôture et historique des sessions de caisse.</p>
        </div>
        <Button onClick={() => router.push('/shop/sales/new')} className="bg-stone-900">
          <LayoutDashboard className="mr-2 h-4 w-4" /> Accéder au POS
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Active */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            {activeSession ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" /> Caisse Ouverte
                  </div>
                  <p className="text-sm"><strong>Caisse:</strong> {activeSession.register_name}</p>
                  <p className="text-sm"><strong>Fonds de départ:</strong> {parseFloat(activeSession.opening_amount).toLocaleString()} FCFA</p>
                  <p className="text-sm"><strong>Ouverte le:</strong> {activeSession.opened_at ? format(new Date(activeSession.opened_at), 'dd/MM/yyyy à HH:mm', { locale: fr }) : '-'}</p>
                </div>
                
                <form onSubmit={handleCloseSession} className="space-y-3 mt-4 border-t pt-4">
                  <h3 className="font-semibold text-sm">Clôturer la caisse</h3>
                  <div>
                    <label className="text-xs text-gray-500">Montant compté (réel)</label>
                    <Input 
                      type="number" 
                      required 
                      value={actualClosingAmount} 
                      onChange={(e) => setActualClosingAmount(e.target.value)} 
                      placeholder="Ex: 150000"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Note (facultatif)</label>
                    <Input 
                      value={closingNotes} 
                      onChange={(e) => setClosingNotes(e.target.value)} 
                      placeholder="Raison d'un écart éventuel..."
                    />
                  </div>
                  <Button type="submit" variant="destructive" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" /> Clôturer et éditer le Rapport Z
                  </Button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleOpenSession} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm mb-4">
                  Aucune session active. Ouvrez une caisse pour commencer à encaisser.
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Choisir une caisse physique</label>
                  <select 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedRegisterId}
                    onChange={(e) => setSelectedRegisterId(e.target.value)}
                  >
                    <option value="">-- Sélectionner --</option>
                    {registers.map(reg => (
                      <option key={reg.id} value={reg.id}>{reg.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Fonds de caisse (Dépôt initial)</label>
                  <Input 
                    type="number" 
                    required 
                    min="0"
                    value={openingAmount} 
                    onChange={(e) => setOpeningAmount(e.target.value)} 
                    placeholder="Montant en FCFA"
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  <LogIn className="mr-2 h-4 w-4" /> Ouvrir la caisse
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Configuration des caisses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Caisses Disponibles</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsCreatingRegister(!isCreatingRegister)}>
              <Plus className="h-4 w-4" /> Nouvelle Caisse
            </Button>
          </CardHeader>
          <CardContent>
            {isCreatingRegister && (
              <form onSubmit={handleCreateRegister} className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <Input 
                  placeholder="Nom de la caisse (ex: Caisse Principale)" 
                  value={newRegisterName}
                  onChange={(e) => setNewRegisterName(e.target.value)}
                  required
                />
                <Button type="submit">Créer</Button>
              </form>
            )}

            <div className="space-y-2">
              {registers.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune caisse configurée.</p>
              ) : (
                registers.map(reg => (
                  <div key={reg.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{reg.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedRegisterForAssignment(reg);
                          setAssignmentModalOpen(true);
                        }}
                        className="text-gray-500 hover:text-brand-600"
                      >
                        <Users size={16} className="mr-1" />
                        Assigner
                      </Button>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des Sessions (Rapports Z)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Caisse</th>
                  <th className="px-4 py-3">Caissier</th>
                  <th className="px-4 py-3">Ouverture</th>
                  <th className="px-4 py-3">Clôture</th>
                  <th className="px-4 py-3 text-right">Attendu</th>
                  <th className="px-4 py-3 text-right">Réel</th>
                  <th className="px-4 py-3 text-right">Écart</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sessionHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      Aucun historique disponible
                    </td>
                  </tr>
                ) : (
                  sessionHistory.map(session => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{session.register_name}</td>
                      <td className="px-4 py-3">{session.first_name} {session.last_name}</td>
                      <td className="px-4 py-3">{session.opened_at ? format(new Date(session.opened_at), 'dd/MM/yy HH:mm') : '-'}</td>
                      <td className="px-4 py-3">
                        {session.closed_at ? format(new Date(session.closed_at), 'dd/MM/yy HH:mm') : <span className="text-green-600 font-medium">En cours</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {session.expected_closing_amount ? parseFloat(session.expected_closing_amount).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {session.actual_closing_amount ? parseFloat(session.actual_closing_amount).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {session.difference_amount !== null ? (
                          <span className={parseFloat(session.difference_amount) < 0 ? 'text-red-500 font-medium' : parseFloat(session.difference_amount) > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                            {parseFloat(session.difference_amount).toLocaleString()}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/shop/cash/sessions/${session.id}`)}
                          className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                        >
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Assignment Modal */}
      {selectedRegisterForAssignment && (
        <RegisterAssignmentModal
          open={assignmentModalOpen}
          onOpenChange={setAssignmentModalOpen}
          registerItem={selectedRegisterForAssignment}
        />
      )}
    </div>
  );
}
