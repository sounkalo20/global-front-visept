'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useSuperAdminCompanyStore from '@/store/superAdmin/superAdminCompanyStore';
import useSuperAdminOwnerStore from '@/store/superAdmin/superAdminOwnerStore';
import useSuperAdminPlanStore from '@/store/superAdmin/superAdminPlanStore';
import { superAdminApi } from '@/lib/api/superAdmin';

const companySchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    description: z.string().optional(),
    business_type_id: z.string().min(1, 'Type requis'),
    country: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    owner_id: z.string().min(1, 'Propriétaire requis'),
    subscription_plan_id: z.string().min(1, 'Plan requis'),
});

export default function CompanyAdminModal({ isOpen, onClose }) {
    const { fetchCompanies, fetchStats } = useSuperAdminCompanyStore();
    const { owners, fetchOwners } = useSuperAdminOwnerStore();
    const { plans, fetchPlans } = useSuperAdminPlanStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOwners();
            fetchPlans();
        }
    }, [isOpen]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: '',
            description: '',
            business_type_id: '1',
            country: '',
            city: '',
            address: '',
            phone: '',
            owner_id: '',
            subscription_plan_id: '',
        },
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await superAdminApi.createCompany(data);
            toast.success('Boutique créée et assignée avec succès !');
            fetchCompanies();
            fetchStats();
            reset();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la création.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Créer une boutique (Super Admin)</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Nom de la boutique</Label>
                        <Input {...register('name')} />
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Propriétaire</Label>
                            <Select onValueChange={(val) => setValue('owner_id', val)} value={watch('owner_id')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {owners.map(owner => (
                                        <SelectItem key={owner.id} value={owner.id.toString()}>
                                            {owner.first_name} {owner.last_name} ({owner.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.owner_id && <span className="text-xs text-red-500">{errors.owner_id.message}</span>}
                        </div>

                        <div className="space-y-2">
                            <Label>Plan d'abonnement</Label>
                            <Select onValueChange={(val) => setValue('subscription_plan_id', val)} value={watch('subscription_plan_id')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map(plan => (
                                        <SelectItem key={plan.id} value={plan.id.toString()}>
                                            {plan.name} {plan.code === 'UNLIMITED' && '👑'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.subscription_plan_id && <span className="text-xs text-red-500">{errors.subscription_plan_id.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type de commerce</Label>
                            <Select onValueChange={(val) => setValue('business_type_id', val)} value={watch('business_type_id')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Boutique (SHOP)</SelectItem>
                                    <SelectItem value="2">Restaurant (RESTAURANT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Téléphone</Label>
                            <Input {...register('phone')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Pays</Label>
                            <Input {...register('country')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Ville</Label>
                            <Input {...register('city')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Adresse</Label>
                        <Input {...register('address')} />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer la boutique
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
