'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useClientStore from '@/store/clientStore';
import useCompanyStore from '@/store/companyStore';

const clientSchema = z.object({
    first_name: z.string().min(2, 'Min. 2 caractères').max(100).optional().or(z.literal('')),
    last_name: z.string().min(2, 'Min. 2 caractères').max(100).optional().or(z.literal('')),
    phone: z.string().min(8, 'Min. 8 caractères').max(30),
    email: z.string().email('Email invalide').max(191).optional().or(z.literal('')),
    address: z.string().max(255).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    notes: z.string().max(500).optional().or(z.literal('')),
});

export default function ClientModal({ open, onOpenChange, client, onSuccess }) {
    const { createClient, updateClient } = useClientStore();
    const { activeCompany } = useCompanyStore();
    const isEditing = !!client;

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(clientSchema),
    });

    useEffect(() => {
        if (open) {
            reset({
                first_name: client?.first_name || '',
                last_name: client?.last_name || '',
                phone: client?.phone || '',
                email: client?.email || '',
                address: client?.address || '',
                city: client?.city || '',
                notes: client?.notes || '',
            });
        }
    }, [client, open, reset]);

    const onSubmit = async (data) => {
        if (!activeCompany) return;
        const payload = { company_id: activeCompany.id, ...data };
        const result = isEditing ? await updateClient(client.id, payload) : await createClient(payload);
        if (result.success) {
            toast.success(isEditing ? 'Client modifié.' : 'Client créé.');
            onOpenChange(false);
            onSuccess?.();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modifiez les informations du client.' : 'Ajoutez un nouveau client à votre base.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5 block">Prénom</label>
                            <Input placeholder="Amadou" error={errors.first_name?.message} {...register('first_name')} />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5 block">Nom</label>
                            <Input placeholder="Diallo" error={errors.last_name?.message} {...register('last_name')} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5 block">Téléphone *</label>
                        <Input placeholder="+223 70 00 00 00" error={errors.phone?.message} {...register('phone')} />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5 block">Email</label>
                        <Input placeholder="client@email.com" error={errors.email?.message} {...register('email')} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5 block">Ville</label>
                            <Input placeholder="Bamako" error={errors.city?.message} {...register('city')} />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5 block">Adresse</label>
                            <Input placeholder="Rue..." error={errors.address?.message} {...register('address')} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5 block">Notes</label>
                        <Input placeholder="Notes internes..." {...register('notes')} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#374151]">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]">Annuler</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                            {isEditing ? 'Enregistrer' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}