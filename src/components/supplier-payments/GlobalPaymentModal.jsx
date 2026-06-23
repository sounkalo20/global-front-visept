// components/supplier-payments/GlobalPaymentModal.jsx (NOUVEAU)
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { suppliersApi } from '@/lib/api/suppliers';
import useCompanyStore from '@/store/companyStore';
import useSupplierPaymentStore from '@/store/supplierPaymentStore';

export default function GlobalPaymentModal({ isOpen, onClose }) {
    const { addPaymentGlobal } = useSupplierPaymentStore();
    const activeCompany = useCompanyStore((s) => s.activeCompany);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            supplier_id: '',
            amount: '0',
            payment_method: 'cash',
            payment_date: new Date().toISOString().split('T')[0],
            payment_reference: '',
            note: '',
        },
    });

    useEffect(() => {
        if (isOpen && activeCompany?.id) {
            suppliersApi.getAll(activeCompany.id, { limit: 200 }).then(r => setSuppliers(r.data.data.suppliers)).catch(() => { });
            reset({
                supplier_id: '', amount: '0', payment_method: 'cash',
                payment_date: new Date().toISOString().split('T')[0], payment_reference: '', note: '',
            });
        }
    }, [isOpen, activeCompany, reset]);

    const handleSupplierChange = (supplierId) => {
        setValue('supplier_id', supplierId);
        const supplier = suppliers.find(s => s.id === parseInt(supplierId));
        setSelectedSupplier(supplier);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const result = await addPaymentGlobal({
            ...data,
            supplier_id: parseInt(data.supplier_id),
            amount: parseFloat(data.amount),
        });
        setIsSubmitting(false);
        if (result.success) { toast.success('Paiement global enregistré.'); onClose(); }
        else toast.error(result.message);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Paiement global</DialogTitle>
                    <p className="text-sm text-gray-500">Paiement non lié à une commande spécifique</p>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Fournisseur *</label>
                        <Select value={watch('supplier_id')} onValueChange={handleSupplierChange}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                            <SelectContent>
                                {suppliers.map(s => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.company_name} {parseFloat(s.current_balance) > 0 ? `(Dû: ${Number(s.current_balance).toLocaleString()} FCFA)` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedSupplier && parseFloat(selectedSupplier.current_balance) > 0 && (
                        <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
                            Solde dû : {Number(selectedSupplier.current_balance).toLocaleString()} FCFA
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Montant *</label>
                        <Input type="number" step="0.01" min="0.01" {...register('amount', { required: 'Requis', min: 0.01 })} />
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