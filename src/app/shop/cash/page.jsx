'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Wallet,
  LogIn,
  LogOut,
  Clock,
  Plus,
  LayoutDashboard,
  Receipt,
  Users,
  Power,
  PowerOff,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import useCompanyStore from '@/store/companyStore';
import useCashStore from '@/store/cashStore';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RegisterAssignmentModal from '@/components/cash/RegisterAssignmentModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function CashManagementPage() {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const {
    registers,
    fetchRegisters,
    createRegister,
    updateRegister,
    toggleRegisterStatus,
    deleteRegister,
    activeSession,
    fetchActiveSession,
    openSession,
    closeSession,
    sessionHistory,
    fetchSessionHistory,
    isLoading
  } = useCashStore();

  const [openingAmount, setOpeningAmount] = useState('');
  const [selectedRegisterId, setSelectedRegisterId] = useState('');
  const [actualClosingAmount, setActualClosingAmount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  const [newRegisterName, setNewRegisterName] = useState('');
  const [isCreatingRegister, setIsCreatingRegister] = useState(false);

  // Modification du nom d'une caisse
  const [editingRegister, setEditingRegister] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Suppression d'une caisse
  const [deletingRegister, setDeletingRegister] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal d'assignation
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedRegisterForAssignment, setSelectedRegisterForAssignment] = useState(null);

  useEffect(() => {
    if (activeCompany) {
      fetchRegisters(activeCompany.id);
      fetchActiveSession(activeCompany.id);
      fetchSessionHistory(activeCompany.id);
    }
  }, [activeCompany, fetchRegisters, fetchActiveSession, fetchSessionHistory]);

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
      fetchRegisters(activeCompany.id);
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
      toast.success(`Caisse clôturée. Écart constaté : ${parseFloat(res.difference_amount || 0).toLocaleString()} FCFA`);
      setActualClosingAmount('');
      setClosingNotes('');
      fetchRegisters(activeCompany.id);
      fetchSessionHistory(activeCompany.id);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleCreateRegister = async (e) => {
    e.preventDefault();
    if (!newRegisterName.trim()) return;
    try {
      await createRegister(activeCompany.id, newRegisterName.trim());
      toast.success("Caisse créée avec succès !");
      setNewRegisterName('');
      setIsCreatingRegister(false);
      fetchRegisters(activeCompany.id);
    } catch (error) {
      // Handled in store
    }
  };

  const handleToggleStatus = async (reg) => {
    if (reg.computed_status === 'in_session') {
      toast.error("Impossible de désactiver une caisse ayant une session en cours. Clôturez-la d'abord.");
      return;
    }
    try {
      const res = await toggleRegisterStatus(reg.id, activeCompany.id);
      toast.success(res.message || "Statut de la caisse mis à jour.");
    } catch (error) {
      // Handled in store
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRegister || !editingName.trim()) return;
    setIsSavingEdit(true);
    try {
      await updateRegister(editingRegister.id, { name: editingName.trim() });
      toast.success("Nom de la caisse modifié avec succès.");
      setEditingRegister(null);
      fetchRegisters(activeCompany.id);
    } catch (error) {
      // Handled in store
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteRegister = async () => {
    if (!deletingRegister) return;
    setIsDeleting(true);
    try {
      await deleteRegister(deletingRegister.id, activeCompany.id);
      toast.success("Caisse supprimée avec succès.");
      setDeletingRegister(null);
      fetchRegisters(activeCompany.id);
    } catch (error) {
      // Handled in store
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-[#F9FAFB]">
            <Wallet className="h-6 w-6 text-brand-600 dark:text-brand-400" /> Gestion de Caisse
          </h1>
          <p className="text-gray-500 dark:text-[#D1D5DB] text-sm mt-1">
            Ouverture, clôture et historique des sessions de caisse.
          </p>
        </div>
        <Button onClick={() => router.push('/shop/sales/new')} className="bg-brand-600 hover:bg-brand-700 text-white h-10 px-4">
          <LayoutDashboard className="mr-2 h-4 w-4" /> Accéder au POS
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Active */}
        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs">
          <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#374151]">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">
              Session Actuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {activeSession ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Caisse Ouverte
                  </div>
                  <div className="text-xs text-gray-700 dark:text-[#D1D5DB] space-y-1">
                    <p><strong className="text-gray-900 dark:text-[#F9FAFB]">Caisse :</strong> {activeSession.register_name}</p>
                    <p><strong className="text-gray-900 dark:text-[#F9FAFB]">Fonds de départ :</strong> {parseFloat(activeSession.opening_amount || 0).toLocaleString()} FCFA</p>
                    <p><strong className="text-gray-900 dark:text-[#F9FAFB]">Ouverte le :</strong> {activeSession.opened_at ? format(new Date(activeSession.opened_at), 'dd/MM/yyyy à HH:mm', { locale: fr }) : '-'}</p>
                  </div>
                </div>

                <form onSubmit={handleCloseSession} className="space-y-3.5 mt-4 border-t border-gray-100 dark:border-[#374151] pt-4">
                  <h3 className="font-semibold text-xs text-gray-900 dark:text-[#F9FAFB] uppercase tracking-wide">Clôturer la caisse</h3>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-[#D1D5DB]">Montant compté (réel en espèces) *</label>
                    <Input
                      type="number"
                      required
                      value={actualClosingAmount}
                      onChange={(e) => setActualClosingAmount(e.target.value)}
                      placeholder="Ex: 150000"
                      className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-gray-900 dark:text-[#F9FAFB]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 dark:text-[#D1D5DB]">Note ou motif d'écart (facultatif)</label>
                    <Input
                      value={closingNotes}
                      onChange={(e) => setClosingNotes(e.target.value)}
                      placeholder="Raison d'un écart éventuel..."
                      className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-gray-900 dark:text-[#F9FAFB]"
                    />
                  </div>
                  <Button type="submit" variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-10 font-semibold mt-2">
                    <LogOut className="mr-2 h-4 w-4" /> Clôturer et éditer le Rapport Z
                  </Button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleOpenSession} className="space-y-4">
                <div className="p-3.5 bg-gray-50 dark:bg-[#1F2937]/50 border border-gray-200 dark:border-[#374151] rounded-xl text-center text-gray-500 dark:text-[#D1D5DB] text-xs">
                  Aucune session active. Choisissez une caisse disponible pour démarrer vos encaissements.
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#D1D5DB]">Choisir une caisse physique *</label>
                  <select
                    required
                    className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#111827] px-3 py-2 text-xs text-gray-900 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                    value={selectedRegisterId}
                    onChange={(e) => setSelectedRegisterId(e.target.value)}
                  >
                    <option value="">-- Sélectionner une caisse libre --</option>
                    {registers.map(reg => {
                      const isFree = reg.computed_status === 'available';
                      const statusLabel =
                        reg.computed_status === 'in_session'
                          ? `(Occupée par ${reg.active_cashier_name || 'un autre caissier'})`
                          : reg.computed_status === 'inactive'
                          ? '(Désactivée)'
                          : '(Libre)';

                      return (
                        <option
                          key={reg.id}
                          value={reg.id}
                          disabled={!isFree}
                          className={!isFree ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-[#F9FAFB]'}
                        >
                          {reg.name} {statusLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-[#D1D5DB]">Fonds de caisse (Dépôt initial en FCFA) *</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={openingAmount}
                    onChange={(e) => setOpeningAmount(e.target.value)}
                    placeholder="Ex: 50000"
                    className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-gray-900 dark:text-[#F9FAFB] text-xs"
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 mt-2">
                  <LogIn className="mr-2 h-4 w-4" /> Ouvrir la caisse
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Configuration des caisses */}
        <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-[#374151]">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">
              Caisses Disponibles ({registers.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingRegister(!isCreatingRegister)}
              className="border-gray-200 dark:border-[#374151] text-xs h-8 hover:bg-gray-100 dark:hover:bg-[#1F2937]"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Nouvelle Caisse
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {isCreatingRegister && (
              <form onSubmit={handleCreateRegister} className="flex gap-2 mb-4 p-3 bg-gray-50 dark:bg-[#1F2937]/50 border border-gray-200 dark:border-[#374151] rounded-xl">
                <Input
                  placeholder="Nom de la caisse (ex: Caisse Principale)"
                  value={newRegisterName}
                  onChange={(e) => setNewRegisterName(e.target.value)}
                  className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-xs text-gray-900 dark:text-[#F9FAFB]"
                  required
                  autoFocus
                />
                <Button type="submit" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white text-xs px-3">
                  Créer
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsCreatingRegister(false); setNewRegisterName(''); }}
                  className="text-xs px-2 text-gray-500 dark:text-[#D1D5DB]"
                >
                  <X size={16} />
                </Button>
              </form>
            )}

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {registers.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-[#9CA3AF] text-center py-6">Aucune caisse configurée.</p>
              ) : (
                registers.map(reg => {
                  const status = reg.computed_status;

                  return (
                    <div
                      key={reg.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-xl transition-all gap-2 ${
                        status === 'in_session'
                          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
                          : status === 'inactive'
                          ? 'opacity-60 bg-gray-50 dark:bg-[#1F2937]/30 border-gray-200 dark:border-[#374151]'
                          : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          status === 'in_session'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : status === 'inactive'
                            ? 'bg-gray-100 dark:bg-[#1F2937] text-gray-400 dark:text-[#9CA3AF]'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          <Receipt size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-gray-900 dark:text-[#F9FAFB] flex items-center gap-1.5">
                            {reg.name}
                          </p>
                          {status === 'in_session' && (
                            <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                              En cours par <strong>{reg.active_cashier_name || 'Caissier'}</strong>
                              {reg.active_opened_at && ` (depuis ${format(new Date(reg.active_opened_at), 'HH:mm')})`}
                            </p>
                          )}
                          {status === 'available' && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                              Prête pour ouverture
                            </p>
                          )}
                          {status === 'inactive' && (
                            <p className="text-[11px] text-gray-500 dark:text-[#9CA3AF] mt-0.5">
                              Caisse désactivée
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                        {/* Badge de statut réel */}
                        {status === 'in_session' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <span className="relative flex h-1.5 w-1.5 mr-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                            </span>
                            En session
                          </span>
                        )}
                        {status === 'available' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                            Libre
                          </span>
                        )}
                        {status === 'inactive' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-[#1F2937] text-gray-600 dark:text-[#9CA3AF] border border-gray-200 dark:border-[#374151]">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1.5" />
                            Désactivée
                          </span>
                        )}

                        {/* Actions */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRegisterForAssignment(reg);
                            setAssignmentModalOpen(true);
                          }}
                          title="Assigner des caissiers"
                          className="h-7 w-7 text-gray-500 hover:text-brand-600 dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]"
                        >
                          <Users size={14} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingRegister(reg);
                            setEditingName(reg.name);
                          }}
                          title="Renommer la caisse"
                          className="h-7 w-7 text-gray-500 hover:text-brand-600 dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]"
                        >
                          <Pencil size={14} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(reg)}
                          title={reg.status === 'active' ? 'Désactiver la caisse' : 'Activer la caisse'}
                          className={`h-7 w-7 ${
                            reg.status === 'active'
                              ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                        >
                          {reg.status === 'active' ? <PowerOff size={14} /> : <Power size={14} />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingRegister(reg)}
                          title="Supprimer la caisse"
                          className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique */}
      <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#374151]">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">
            Historique des Sessions (Rapports Z)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/80 dark:bg-[#1F2937]/80 text-gray-500 dark:text-[#D1D5DB] uppercase text-[11px] border-b border-gray-200 dark:border-[#374151]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Caisse</th>
                  <th className="px-4 py-3 font-semibold">Caissier</th>
                  <th className="px-4 py-3 font-semibold">Ouverture</th>
                  <th className="px-4 py-3 font-semibold">Clôture</th>
                  <th className="px-4 py-3 text-right font-semibold">Attendu</th>
                  <th className="px-4 py-3 text-right font-semibold">Réel</th>
                  <th className="px-4 py-3 text-right font-semibold">Écart</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
                {sessionHistory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500 dark:text-[#9CA3AF]">
                      Aucun historique de session disponible
                    </td>
                  </tr>
                ) : (
                  sessionHistory.map(session => (
                    <tr key={session.id} className="hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-[#F9FAFB]">{session.register_name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-[#D1D5DB]">{session.first_name} {session.last_name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-[#9CA3AF]">{session.opened_at ? format(new Date(session.opened_at), 'dd/MM/yy HH:mm') : '-'}</td>
                      <td className="px-4 py-3">
                        {session.closed_at ? (
                          <span className="text-gray-600 dark:text-[#9CA3AF]">
                            {format(new Date(session.closed_at), 'dd/MM/yy HH:mm')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                            En cours
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-[#D1D5DB]">
                        {session.expected_closing_amount ? `${parseFloat(session.expected_closing_amount).toLocaleString()} F` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-[#D1D5DB]">
                        {session.actual_closing_amount ? `${parseFloat(session.actual_closing_amount).toLocaleString()} F` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {session.difference_amount !== null ? (
                          <span className={
                            parseFloat(session.difference_amount) < 0
                              ? 'text-red-600 dark:text-red-400'
                              : parseFloat(session.difference_amount) > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-500 dark:text-[#9CA3AF]'
                          }>
                            {parseFloat(session.difference_amount).toLocaleString()} F
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/shop/cash/sessions/${session.id}`)}
                          className="text-brand-600 dark:text-brand-400 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-xs h-7 px-2.5"
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

      {/* Modal d'édition du nom de caisse */}
      <Dialog open={!!editingRegister} onOpenChange={(open) => !open && setEditingRegister(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">
              Modifier la caisse
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-[#D1D5DB]">
              Renommez cette caisse physique pour faciliter son identification.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <label className="text-xs font-semibold text-gray-700 dark:text-[#D1D5DB] block mb-1.5">
              Nom de la caisse *
            </label>
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder="Ex: Caisse Comptoir 1"
              className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-xs text-gray-900 dark:text-[#F9FAFB]"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingRegister(null)}
              disabled={isSavingEdit}
              className="border-gray-200 dark:border-[#374151] text-xs h-9"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={isSavingEdit || !editingName.trim()}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs h-9 font-semibold px-4"
            >
              {isSavingEdit ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={!!deletingRegister} onOpenChange={(open) => !open && setDeletingRegister(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">
                  Supprimer la caisse
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-[#D1D5DB] mt-0.5">
                  Êtes-vous sûr de vouloir supprimer "{deletingRegister?.name}" ?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-2 text-xs text-gray-600 dark:text-[#D1D5DB]">
            <p className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 p-2.5 rounded-xl">
              ⚠️ Note : Si cette caisse a déjà enregistré des ventes ou sessions, la suppression sera bloquée pour préserver la comptabilité. Vous pourrez alors la désactiver.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingRegister(null)}
              disabled={isDeleting}
              className="border-gray-200 dark:border-[#374151] text-xs h-9"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteRegister}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 font-semibold px-4"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
