// components/supplier-orders/OrderFormModal.jsx
'use client';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { suppliersApi } from '@/lib/api/suppliers';
import useCompanyStore from '@/store/companyStore';
import useSupplierOrderStore from '@/store/supplierOrderStore';

export default function OrderFormModal({ isOpen, onClose, order }) {
    const isEditing = !!order;
    const { createOrder, updateOrder } = useSupplierOrderStore();
    const activeCompany = useCompanyStore((s) => s.activeCompany);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [includePayment, setIncludePayment] = useState(false);

    const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            supplier_id: '',
            reference: '',
            expected_at: '',
            shipping_cost: '0',
            tax_amount: '0',
            notes: '',
            items: [{ product_id: '', quantity_ordered: '1', unit_cost: '0' }],
            initial_payment: { amount: '0', payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0], payment_reference: '', note: '' },
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    useEffect(() => {
        if (isOpen && activeCompany?.id) {
            suppliersApi.getAll(activeCompany.id, { limit: 200, status: 'active' }).then(r => setSuppliers(r.data.data.suppliers)).catch(() => { });
            // Récupérer les produits
            import('@/lib/api/products').then(m => {
                m.productsApi.getAll(activeCompany.id).then(r => setProducts(r.data.data.products || [])).catch(() => { });
            });
            if (order) {
                reset({
                    supplier_id: String(order.supplier_id),
                    reference: order.reference || '',
                    expected_at: order.expected_at ? order.expected_at.split('T')[0] : '',
                    shipping_cost: order.shipping_cost || '0',
                    tax_amount: order.tax_amount || '0',
                    notes: order.notes || '',
                    items: [{ product_id: '', quantity_ordered: '1', unit_cost: '0' }],
                });
            } else {
                reset({
                    supplier_id: '', reference: '', expected_at: '', shipping_cost: '0', tax_amount: '0', notes: '',
                    items: [{ product_id: '', quantity_ordered: '1', unit_cost: '0' }],
                    initial_payment: { amount: '0', payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0], payment_reference: '', note: '' },
                });
            }
        }
    }, [isOpen, order, reset, activeCompany]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const payload = {
            ...data,
            supplier_id: parseInt(data.supplier_id),
            company_id: activeCompany.id,
            items: data.items.map(i => ({ ...i, product_id: parseInt(i.product_id), quantity_ordered: parseFloat(i.quantity_ordered), unit_cost: parseFloat(i.unit_cost) })),
        };
        if (!includePayment) delete payload.initial_payment;
        else payload.initial_payment = { ...payload.initial_payment, amount: parseFloat(payload.initial_payment.amount) };

        const result = isEditing ? await updateOrder(order.id, payload) : await createOrder(payload);
        setIsSubmitting(false);
        if (result.success) { toast.success(isEditing ? 'Commande mise à jour.' : 'Commande créée.'); onClose(); }
        else toast.error(result.message);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{isEditing ? 'Modifier la commande' : 'Nouvelle commande'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Fournisseur *</label>
                            <Select value={watch('supplier_id')} onValueChange={(v) => setValue('supplier_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.company_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Référence externe</label>
                            <Input placeholder="Bon de commande..." {...register('reference')} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Livraison prévue</label>
                            <Input type="date" {...register('expected_at')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Frais livraison</label>
                            <Input type="number" step="0.01" min="0" {...register('shipping_cost')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Taxe</label>
                            <Input type="number" step="0.01" min="0" {...register('tax_amount')} />
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Articles</label>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ product_id: '', quantity_ordered: '1', unit_cost: '0' })}>
                                <Plus size={14} className="mr-1" /> Ajouter
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-2 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <Select value={watch(`items.${index}.product_id`)} onValueChange={(v) => setValue(`items.${index}.product_id`, v)}>
                                            <SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24">
                                        <Input type="number" step="0.001" min="0.001" placeholder="Qté" {...register(`items.${index}.quantity_ordered`)} />
                                    </div>
                                    <div className="w-28">
                                        <Input type="number" step="0.01" min="0" placeholder="Prix unit." {...register(`items.${index}.unit_cost`)} />
                                    </div>
                                    {fields.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-500 shrink-0">
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Paiement initial */}
                    <div className="border rounded-lg p-3">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" onClick={() => setIncludePayment(!includePayment)}>
                            <input type="checkbox" checked={includePayment} onChange={(e) => setIncludePayment(e.target.checked)} className="rounded" />
                            Paiement initial
                        </label>
                        {includePayment && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <Input type="number" step="0.01" min="0" placeholder="Montant" {...register('initial_payment.amount')} />
                                <Select value={watch('initial_payment.payment_method')} onValueChange={(v) => setValue('initial_payment.payment_method', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Espèces</SelectItem>
                                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                        <SelectItem value="bank_transfer">Virement</SelectItem>
                                        <SelectItem value="check">Chèque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <Input placeholder="Notes internes..." {...register('notes')} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer la commande'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}