// components/suppliers/SupplierFormModal.jsx
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import useSupplierStore from '@/store/supplierStore';

export default function SupplierFormModal({ isOpen, onClose, supplier }) {
    const isEditing = !!supplier;
    const { createSupplier, updateSupplier } = useSupplierStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            company_name: '',
            contact_name: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            country: '',
            notes: '',
            initial_balance: '0',
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (supplier) {
                reset({
                    company_name: supplier.company_name || '',
                    contact_name: supplier.contact_name || '',
                    phone: supplier.phone || '',
                    email: supplier.email || '',
                    address: supplier.address || '',
                    city: supplier.city || '',
                    country: supplier.country || '',
                    notes: supplier.notes || '',
                    initial_balance: '0',
                });
            } else {
                reset({
                    company_name: '',
                    contact_name: '',
                    phone: '',
                    email: '',
                    address: '',
                    city: '',
                    country: '',
                    notes: '',
                    initial_balance: '0',
                });
            }
        }
    }, [isOpen, supplier, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        const payload = {
            ...data,
            initial_balance: isEditing ? undefined : parseFloat(data.initial_balance) || 0,
        };

        // Nettoyer les champs vides
        Object.keys(payload).forEach((key) => {
            if (payload[key] === '' && key !== 'initial_balance') {
                payload[key] = null;
            }
        });

        let result;
        if (isEditing) {
            result = await updateSupplier(supplier.id, payload);
        } else {
            result = await createSupplier(payload);
        }

        setIsSubmitting(false);

        if (result.success) {
            toast.success(isEditing ? 'Fournisseur mis à jour.' : 'Fournisseur créé avec succès.');
            onClose();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifiez les informations du fournisseur.'
                            : 'Ajoutez un nouveau fournisseur à votre entreprise.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Nom du fournisseur <span className="text-red-400">*</span>
                        </label>
                        <Input
                            placeholder="Ex: Orange Mali"
                            {...register('company_name', { required: 'Nom requis' })}
                            error={errors.company_name?.message}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nom du contact</label>
                        <Input
                            placeholder="Ex: Moussa Diallo"
                            {...register('contact_name')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Téléphone <span className="text-red-400">*</span>
                            </label>
                            <Input
                                placeholder="+223 00 00 00 00"
                                {...register('phone', { required: 'Téléphone requis' })}
                                error={errors.phone?.message}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input
                                type="email"
                                placeholder="contact@fournisseur.com"
                                {...register('email')}
                                error={errors.email?.message}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Adresse</label>
                        <Input
                            placeholder="123 Rue Principale"
                            {...register('address')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Ville</label>
                            <Input placeholder="Bamako" {...register('city')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Pays</label>
                            <Input placeholder="Mali" {...register('country')} />
                        </div>
                    </div>

                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Solde initial dû <span className="text-gray-400 font-normal">(optionnel)</span>
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Montant déjà dû au fournisseur"
                                {...register('initial_balance')}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Anciennes créances à suivre dans le système.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <Textarea
                            rows={3}
                            placeholder="Notes internes..."
                            {...register('notes')}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}