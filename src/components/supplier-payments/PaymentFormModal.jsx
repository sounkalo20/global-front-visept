// components/supplier-payments/PaymentFormModal.jsx (REMPLACER)
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import useSupplierPaymentStore from '@/store/supplierPaymentStore';

export default function PaymentFormModal({ isOpen, onClose, orderId, orderNumber, remainingBalance, isOrderPayment = false }) {
    const { addPaymentToOrder, fetchAllPayments } = useSupplierPaymentStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            amount: remainingBalance || '0',
            payment_method: 'cash',
            payment_date: new Date().toISOString().split('T')[0],
            payment_reference: '',
            note: '',
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                amount: remainingBalance || '0',
                payment_method: 'cash',
                payment_date: new Date().toISOString().split('T')[0],
                payment_reference: '',
                note: '',
            });
        }
    }, [isOpen, remainingBalance, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        let result;
        if (isOrderPayment && orderId) {
            // Paiement lié à une commande via la route /supplier-orders/:id/payments
            result = await addPaymentToOrder(orderId, {
                amount: parseFloat(data.amount),
                payment_method: data.payment_method,
                payment_reference: data.payment_reference,
                payment_date: data.payment_date,
                note: data.note,
            });
        }

        setIsSubmitting(false);

        if (result.success) {
            toast.success('Paiement enregistré.');
            onClose();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nouveau paiement</DialogTitle>
                    {orderNumber && (
                        <p className="text-sm text-gray-500">
                            {orderNumber} • Reste à payer : {Number(remainingBalance).toLocaleString()} FCFA
                        </p>
                    )}
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Montant *</label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            {...register('amount', { required: 'Montant requis', min: 0.01 })}
                            error={errors.amount?.message}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Méthode *</label>
                        <Select value={watch('payment_method')} onValueChange={(v) => setValue('payment_method', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Espèces</SelectItem>
                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                <SelectItem value="bank_transfer">Virement</SelectItem>
                                <SelectItem value="check">Chèque</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date *</label>
                        <Input type="date" {...register('payment_date', { required: 'Date requise' })} />
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le paiement'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}