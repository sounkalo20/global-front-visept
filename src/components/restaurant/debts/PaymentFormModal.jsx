// components/restaurant/PaymentFormModal.jsx
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import useRestaurantPaymentStore from '@/store/restaurantPaymentStore';

export default function PaymentFormModal({ isOpen, onClose, debt }) {
    const { createPayment } = useRestaurantPaymentStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            amount: '', payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0],
            payment_reference: '', note: '',
        },
    });

    useEffect(() => {
        if (isOpen && debt) {
            reset({
                amount: debt.remaining_amount || '', payment_method: 'cash',
                payment_date: new Date().toISOString().split('T')[0], payment_reference: '', note: '',
            });
        }
    }, [isOpen, debt, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const result = await createPayment({
            client_debt_id: debt.id,
            amount: parseFloat(data.amount),
            payment_method: data.payment_method,
            payment_reference: data.payment_reference || null,
            payment_date: data.payment_date,
            note: data.note || null,
        });
        setIsSubmitting(false);
        if (result.success) { toast.success('Paiement enregistré.'); onClose(); }
        else toast.error(result.message);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enregistrer un paiement</DialogTitle>
                    <p className="text-sm text-gray-500">{debt?.client_name} • Reste à payer : {Number(debt?.remaining_amount).toLocaleString()} FCFA</p>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Montant *</label>
                        <Input type="number" step="0.01" min="0.01" max={debt?.remaining_amount} {...register('amount', { required: 'Requis', min: 0.01 })} error={errors.amount?.message} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Méthode *</label>
                        <Select value={watch('payment_method')} onValueChange={(v) => setValue('payment_method', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Espèces</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                <SelectItem value="bank_transfer">Virement</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date *</label>
                        <Input type="date" {...register('payment_date', { required: 'Requis' })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Référence</label>
                        <Input placeholder="N° transaction..." {...register('payment_reference')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Note</label>
                        <Input placeholder="Note..." {...register('note')} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}