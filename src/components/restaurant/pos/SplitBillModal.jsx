'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Banknote, Smartphone, CheckCircle, Split } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import useCompanyStore from '@/store/companyStore';

export default function SplitBillModal({ isOpen, onClose, sale, onSuccess }) {
  const { activeCompany } = useCompanyStore();
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' (division N parts) ou 'items' (par plats)
  const [parts, setParts] = useState(2);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  if (!sale) return null;

  const totalAmount = Number(sale.total_amount || 0);
  const amountPaid = Number(sale.amount_paid || 0);
  const amountDue = Number(sale.amount_due ?? (totalAmount - amountPaid));

  const perPersonAmount = Math.ceil(amountDue / (parts || 1));
  const activePayAmount = customAmount ? Number(customAmount) : perPersonAmount;

  const handleProcessPayment = async () => {
    if (!activeCompany?.id) return;
    if (activePayAmount <= 0) {
      toast.error('Le montant du paiement doit être supérieur à 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `/restaurant/sales/${sale.id}/split-payment`,
        {
          payments: [
            {
              payment_method: selectedPaymentMethod,
              amount: activePayAmount,
              reference: paymentReference || null,
            },
          ],
        },
        { headers: { 'x-company-id': activeCompany.id } }
      );

      if (res.data.success) {
        toast.success(res.data.message || 'Paiement enregistré avec succès !');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du traitement du paiement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Split className="text-amber-600" size={20} />
            Encaissement & Split Bill — Table #{sale.table_id || ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 my-2">
          {/* Récapitulatif Montants */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border text-center">
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block uppercase">Total Session</span>
              <span className="font-bold text-sm text-gray-900">{totalAmount.toLocaleString()} F</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block uppercase">Déjà Déglé</span>
              <span className="font-bold text-sm text-emerald-600">{amountPaid.toLocaleString()} F</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 font-semibold block uppercase">Reste à Payer</span>
              <span className="font-bold text-sm text-amber-700">{amountDue.toLocaleString()} F</span>
            </div>
          </div>

          {/* Modes de Division */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setSplitMode('equal')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                splitMode === 'equal' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Division Égale (N parts)
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('custom')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                splitMode === 'custom' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Montant Libre / Partiel
            </button>
          </div>

          {splitMode === 'equal' ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Nombre de personnes / parts :</label>
              <div className="flex items-center gap-3">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setParts(n); setCustomAmount(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      parts === n ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {n} parts
                  </button>
                ))}
              </div>
              <div className="text-xs text-center text-amber-800 font-semibold bg-amber-50 py-2 rounded-lg mt-2">
                Soit <span className="font-bold text-sm">{perPersonAmount.toLocaleString()} FCFA</span> par personne
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Montant à encaisser maintenant (FCFA) :</label>
              <Input
                type="number"
                placeholder={`Ex: ${amountDue}`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="font-bold"
              />
            </div>
          )}

          {/* Choix du Moyen de Paiement */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">Moyen de Règlement :</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Espèces', icon: Banknote },
                { id: 'wave', label: 'Wave', icon: Smartphone },
                { id: 'orange_money', label: 'Orange Money', icon: Smartphone },
                { id: 'mtn_momo', label: 'MTN MoMo', icon: Smartphone },
                { id: 'card', label: 'Carte / TPE', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const active = selectedPaymentMethod === m.id;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(m.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                      active ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-brand-600' : 'text-gray-400'} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPaymentMethod !== 'cash' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Référence de Transaction :</label>
              <Input
                type="text"
                placeholder="Ex: TXN-98482012"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="text-xs"
              />
            </div>
          )}

          {/* Bouton de confirmation */}
          <Button
            onClick={handleProcessPayment}
            disabled={isSubmitting || activePayAmount <= 0}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                Encaisser {activePayAmount.toLocaleString()} FCFA
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
