'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import useDebtStore from '@/store/debtStore';
import useCompanyStore from '@/store/companyStore';

export default function PaymentModal({ debt, open, onOpenChange, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentReference, setPaymentReference] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createPayment } = useDebtStore();
    const { activeCompany } = useCompanyStore();

    const remaining = debt?.remaining_amount || 0;

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Veuillez entrer un montant valide.');
            return;
        }
        if (parseFloat(amount) > remaining) {
            toast.error('Le montant dépasse le reste à payer.');
            return;
        }

        setIsSubmitting(true);
        const result = await createPayment({
            company_id: activeCompany.id,
            client_debt_id: debt.id,
            amount: parseFloat(amount),
            payment_method: paymentMethod,
            payment_reference: paymentReference || null,
            note: note || null,
        });
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Paiement enregistré.');
            onOpenChange(false);
            setAmount('');
            setPaymentReference('');
            setNote('');
            onSuccess?.();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><CreditCard size={18} /> Ajouter un paiement</DialogTitle>
                    <DialogDescription>
                        Reste à payer : <strong className="text-red-600">{parseInt(remaining).toLocaleString()} FCFA</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Montant *</label>
                        <Input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-lg font-semibold" autoFocus />
                        <div className="flex gap-2 mt-2">
                            {[remaining, Math.ceil(remaining / 2), Math.ceil(remaining / 4)].filter(v => v > 0).map((v) => (
                                <Button key={v} variant="outline" size="sm" onClick={() => setAmount(v.toString())} className="text-xs">{parseInt(v).toLocaleString()} F</Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Méthode de paiement</label>
                        <div className="flex gap-1 mt-1">
                            {['cash', 'mobile_money', 'bank_transfer'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setPaymentMethod(m)}
                                    className={cn('flex-1 py-2 text-xs font-medium rounded-lg border transition-colors',
                                        paymentMethod === m ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300')}
                                >
                                    {m === 'cash' ? '💵 Cash' : m === 'mobile_money' ? '📱 Mobile' : '🏦 Virement'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {paymentMethod !== 'cash' && (
                        <div>
                            <label className="text-sm font-medium text-gray-700">Référence</label>
                            <Input placeholder="N° transaction" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-gray-700">Note</label>
                        <Input placeholder="Note optionnelle" value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>

                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                        Enregistrer le paiement
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}