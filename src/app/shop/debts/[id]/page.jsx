'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Calendar, DollarSign, CreditCard, Edit, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import useDebtStore from '@/store/debtStore';
import useCompanyStore from '@/store/companyStore';

const statusBadge = (status) => {
  const map = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
    partial: { label: 'Partiel', color: 'bg-amber-100 text-amber-700' },
    paid: { label: 'Payé', color: 'bg-green-100 text-green-700' },
    overdue: { label: 'En retard', color: 'bg-red-100 text-red-700' },
    canceled: { label: 'Annulé', color: 'bg-gray-100 text-gray-500' },
  };
  return map[status] || { label: status, color: 'bg-gray-100' };
};

export default function DebtDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentDebt, fetchDebtById, updateDebt, cancelDebt, createPayment, deletePayment, isLoading } = useDebtStore();
  const { activeCompany } = useCompanyStore();

  // États pour les modals
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState(null);

  // États pour le formulaire de paiement
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // États pour l'édition de la dette
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const loadDebt = useCallback(() => {
    if (activeCompany && id) fetchDebtById(id, activeCompany.id);
  }, [id, activeCompany]);

  useEffect(() => { loadDebt(); }, [loadDebt]);

  // Initialiser les champs d'édition quand la dette est chargée
  useEffect(() => {
    if (currentDebt) {
      setEditDueDate(currentDebt.due_date ? currentDebt.due_date.split('T')[0] : '');
      setEditNotes(currentDebt.notes || '');
    }
  }, [currentDebt]);

  // Ajouter un paiement
  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Montant invalide.');
      return;
    }
    const remaining = parseFloat(currentDebt?.remaining_amount || 0);
    if (parseFloat(paymentAmount) > remaining) {
      toast.error('Le montant dépasse le reste à payer.');
      return;
    }

    setIsSubmittingPayment(true);
    const result = await createPayment({
      company_id: activeCompany.id,
      client_debt_id: currentDebt.id,
      amount: parseFloat(paymentAmount),
      payment_method: paymentMethod,
      payment_reference: paymentReference || null,
      note: paymentNote || null,
    });
    setIsSubmittingPayment(false);

    if (result.success) {
      toast.success('Paiement enregistré.');
      setPaymentOpen(false);
      setPaymentAmount('');
      setPaymentReference('');
      setPaymentNote('');
      loadDebt();
    } else {
      toast.error(result.message);
    }
  };

  // Supprimer un paiement
  const handleDeletePayment = async (paymentId) => {
    const result = await deletePayment(paymentId, activeCompany.id);
    if (result.success) {
      toast.success('Paiement supprimé.');
      setDeletePaymentId(null);
      loadDebt();
    } else {
      toast.error(result.message);
    }
  };

  // Modifier la dette
  const handleUpdateDebt = async () => {
    setIsSubmittingEdit(true);
    const result = await updateDebt(currentDebt.id, {
      company_id: activeCompany.id,
      due_date: editDueDate || null,
      notes: editNotes || null,
    });
    setIsSubmittingEdit(false);
    if (result.success) {
      toast.success('Dette modifiée.');
      setEditOpen(false);
      loadDebt();
    } else {
      toast.error(result.message);
    }
  };

  // Annuler la dette
  const handleCancelDebt = async () => {
    const result = await cancelDebt(currentDebt.id, activeCompany.id);
    if (result.success) {
      toast.success('Dette annulée.');
      setCancelOpen(false);
      loadDebt();
    } else {
      toast.error(result.message);
    }
  };

  if (isLoading || !currentDebt) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  const badge = statusBadge(currentDebt.status);
  const totalPaid = parseFloat(currentDebt.total_paid || 0);
  const progress = parseFloat(currentDebt.total_amount) > 0 ? (totalPaid / parseFloat(currentDebt.total_amount)) * 100 : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/shop/debts')}><ArrowLeft size={18} /></Button>
            <div>
              <h1 className="text-xl font-bold">Dette {currentDebt.sale_number ? `- ${currentDebt.sale_number}` : `#${currentDebt.id}`}</h1>
              <p className="text-sm text-gray-500">Créée le {new Date(currentDebt.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {currentDebt.status !== 'canceled' && currentDebt.status !== 'paid' && (
              <Button onClick={() => setPaymentOpen(true)}><CreditCard size={16} className="mr-2" /> Ajouter un paiement</Button>
            )}
            {currentDebt.status !== 'canceled' && (
              <Button variant="outline" onClick={() => setEditOpen(true)}><Edit size={16} className="mr-2" /> Modifier</Button>
            )}
            {currentDebt.status !== 'canceled' && (
              <Button variant="outline" onClick={() => setCancelOpen(true)} className="text-red-600 border-red-300">
                <AlertCircle size={16} className="mr-2" /> Annuler
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne gauche */}
          <div className="lg:col-span-2 space-y-4">
            {/* Client */}
            <div className="rounded-xl border bg-white p-5">
              <h3 className="font-medium mb-3 flex items-center gap-2"><User size={16} /> Client</h3>
              <p className="font-medium">{currentDebt.client_name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Phone size={12} /> {currentDebt.client_phone}</p>
              {currentDebt.client_email && <p className="text-sm text-gray-500">{currentDebt.client_email}</p>}
            </div>

            {/* Produits */}
            {currentDebt.sale_items?.length > 0 && (
              <div className="rounded-xl border bg-white p-5">
                <h3 className="font-medium mb-3">Produits vendus</h3>
                <div className="space-y-2">
                  {currentDebt.sale_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.product_name}</p>
                        <p className="text-xs text-gray-400">{item.quantity} x {parseInt(item.unit_price).toLocaleString()} F</p>
                      </div>
                      <p className="font-medium text-sm">{parseInt(item.total_price).toLocaleString()} F</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historique des paiements */}
            <div className="rounded-xl border bg-white p-5">
              <h3 className="font-medium mb-3">Historique des paiements ({currentDebt.payments?.length || 0})</h3>
              {currentDebt.payments?.length > 0 ? (
                <div className="space-y-2">
                  {currentDebt.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium text-green-600">+{parseInt(payment.amount).toLocaleString()} F</p>
                        <p className="text-xs text-gray-400">
                          {new Date(payment.payment_date).toLocaleDateString('fr-FR')} • {payment.payment_method?.replace('_', ' ')}
                          {payment.received_by_name ? ` • ${payment.received_by_name}` : ''}
                        </p>
                        {payment.note && <p className="text-xs text-gray-500">{payment.note}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.payment_reference && <p className="text-xs text-gray-400">Réf : {payment.payment_reference}</p>}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-600"
                          onClick={() => setDeletePaymentId(payment.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">Aucun paiement enregistré.</p>
              )}
            </div>
          </div>

          {/* Colonne droite - Résumé */}
          <div className="rounded-xl border bg-white p-5 h-fit space-y-4 lg:sticky lg:top-4">
            <h3 className="font-medium">Résumé</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Montant total</span><span className="font-medium">{parseInt(currentDebt.total_amount || 0).toLocaleString()} F</span></div>
              <div className="flex justify-between text-green-600"><span>Payé</span><span className="font-medium">{totalPaid.toLocaleString()} F</span></div>
              <div className="flex justify-between text-red-600 font-bold text-lg pt-2 border-t">
                <span>Reste à payer</span><span>{parseInt(currentDebt.remaining_amount || 0).toLocaleString()} F</span>
              </div>
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', progress >= 100 ? 'bg-green-500' : 'bg-brand-600')} style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
            <p className="text-xs text-gray-400 text-center">{Math.round(progress)}% payé</p>

            <div className="pt-3 border-t space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', badge.color)}>{badge.label}</span>
              </div>
              <p className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /> Échéance : {currentDebt.due_date ? new Date(currentDebt.due_date).toLocaleDateString('fr-FR') : 'Non définie'}</p>
              {currentDebt.notes && <p className="text-gray-500 text-xs mt-2">📝 {currentDebt.notes}</p>}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal ajout paiement */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard size={18} /> Ajouter un paiement</DialogTitle>
            <DialogDescription>
              Reste à payer : <strong className="text-red-600">{parseInt(currentDebt?.remaining_amount || 0).toLocaleString()} FCFA</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">Montant *</label>
              <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="text-lg font-semibold" autoFocus />
              <div className="flex gap-2 mt-2">
                {[currentDebt?.remaining_amount, Math.ceil((currentDebt?.remaining_amount || 0) / 2)].filter(v => v > 0).map((v) => (
                  <Button key={v} variant="outline" size="sm" onClick={() => setPaymentAmount(v.toString())} className="text-xs">{parseInt(v).toLocaleString()} F</Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Méthode</label>
              <div className="flex gap-1 mt-1">
                {['cash', 'mobile_money', 'bank_transfer'].map((m) => (
                  <button key={m} onClick={() => setPaymentMethod(m)} className={cn('flex-1 py-2 text-xs rounded-lg border', paymentMethod === m ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600')}>
                    {m === 'cash' ? 'Cash' : m === 'mobile_money' ? 'Mobile' : 'Virement'}
                  </button>
                ))}
              </div>
            </div>
            {paymentMethod !== 'cash' && <Input placeholder="Référence" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />}
            <Input placeholder="Note (optionnelle)" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} />
            <Button onClick={handleAddPayment} disabled={isSubmittingPayment} className="w-full">
              {isSubmittingPayment ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Enregistrer le paiement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal édition dette */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la dette</DialogTitle>
            <DialogDescription>Modifiez la date d'échéance et les notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">Date d'échéance</label>
              <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input placeholder="Notes internes..." value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
            <Button onClick={handleUpdateDebt} disabled={isSubmittingEdit} className="w-full">
              {isSubmittingEdit ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Enregistrer les modifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal confirmation annulation */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-red-100 p-2"><AlertCircle size={20} className="text-red-600" /></div>
              <DialogTitle>Annuler la dette</DialogTitle>
            </div>
            <DialogDescription>
              Voulez-vous vraiment annuler cette dette de <strong>{currentDebt?.client_name}</strong> ?<br />
              Montant restant : <strong className="text-red-600">{parseInt(currentDebt?.remaining_amount || 0).toLocaleString()} FCFA</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Retour</Button>
            <Button onClick={handleCancelDebt} className="bg-red-600 hover:bg-red-700 text-white">Confirmer l'annulation</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal confirmation suppression paiement */}
      <Dialog open={!!deletePaymentId} onOpenChange={() => setDeletePaymentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le paiement</DialogTitle>
            <DialogDescription>Voulez-vous vraiment supprimer ce paiement ? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeletePaymentId(null)}>Annuler</Button>
            <Button onClick={() => handleDeletePayment(deletePaymentId)} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 size={16} className="mr-2" /> Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}