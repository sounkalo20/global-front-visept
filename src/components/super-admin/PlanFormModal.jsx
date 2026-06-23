// components/super-admin/PlanFormModal.jsx
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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import useSuperAdminPlanStore from '@/store/superAdmin/superAdminPlanStore';

const DEFAULT_FEATURES = {
    reports: false,
    suppliers: false,
    api_access: false,
    promotions: false,
    advanced_stock: false,
};

export default function PlanFormModal({ isOpen, onClose, plan }) {
    const isEditing = !!plan;
    const { createPlan, updatePlan } = useSuperAdminPlanStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
        defaultValues: {
            code: '',
            name: '',
            price_monthly: '0',
            price_yearly: '0',
            max_employees: '',
            max_products: '',
            max_clients: '',
            features: { ...DEFAULT_FEATURES },
            is_active: true,
        },
    });

    const features = watch('features');

    useEffect(() => {
        if (isOpen) {
            if (plan) {
                const parsedFeatures = plan.features
                    ? typeof plan.features === 'string'
                        ? JSON.parse(plan.features)
                        : plan.features
                    : { ...DEFAULT_FEATURES };

                reset({
                    code: plan.code || '',
                    name: plan.name || '',
                    price_monthly: String(plan.price_monthly || '0'),
                    price_yearly: String(plan.price_yearly || '0'),
                    max_employees: plan.max_employees || '',
                    max_products: plan.max_products || '',
                    max_clients: plan.max_clients || '',
                    features: { ...DEFAULT_FEATURES, ...parsedFeatures },
                    is_active: plan.is_active ?? true,
                });
            } else {
                reset({
                    code: '',
                    name: '',
                    price_monthly: '0',
                    price_yearly: '0',
                    max_employees: '',
                    max_products: '',
                    max_clients: '',
                    features: { ...DEFAULT_FEATURES },
                    is_active: true,
                });
            }
        }
    }, [isOpen, plan, reset]);

    const toggleFeature = (key) => {
        setValue(`features.${key}`, !features[key]);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        const payload = {
            ...data,
            price_monthly: parseFloat(data.price_monthly),
            price_yearly: parseFloat(data.price_yearly),
            max_employees: data.max_employees ? parseInt(data.max_employees) : null,
            max_products: data.max_products ? parseInt(data.max_products) : null,
            max_clients: data.max_clients ? parseInt(data.max_clients) : null,
        };

        let result;
        if (isEditing) {
            result = await updatePlan(plan.id, payload);
        } else {
            result = await createPlan(payload);
        }

        setIsSubmitting(false);

        if (result.success) {
            toast.success(isEditing ? 'Plan mis à jour.' : 'Plan créé avec succès.');
            onClose();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Modifier le plan' : 'Créer un plan'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Modifiez les informations du plan.'
                            : 'Définissez un nouveau plan d\'abonnement.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Code & Nom */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Code *</label>
                            <Input
                                placeholder="PREMIUM"
                                {...register('code', { required: 'Code requis' })}
                                error={errors.code?.message}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nom *</label>
                            <Input
                                placeholder="Premium"
                                {...register('name', { required: 'Nom requis' })}
                                error={errors.name?.message}
                            />
                        </div>
                    </div>

                    {/* Prix */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Prix mensuel (FCFA) *</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...register('price_monthly', { required: 'Prix requis', min: 0 })}
                                error={errors.price_monthly?.message}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Prix annuel (FCFA) *</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...register('price_yearly', { required: 'Prix requis', min: 0 })}
                                error={errors.price_yearly?.message}
                            />
                        </div>
                    </div>

                    {/* Limites */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Limites (laisser vide = illimité)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Employés"
                                    {...register('max_employees')}
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Produits"
                                    {...register('max_products')}
                                />
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Clients"
                                    {...register('max_clients')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fonctionnalités */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Fonctionnalités incluses</label>
                        <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                            {Object.keys(DEFAULT_FEATURES).map((key) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                                    <Switch
                                        checked={features?.[key] || false}
                                        onCheckedChange={() => toggleFeature(key)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Statut */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div>
                            <p className="text-sm font-medium">Plan actif</p>
                            <p className="text-xs text-gray-500">Disponible pour les nouvelles entreprises</p>
                        </div>
                        <Switch
                            checked={watch('is_active')}
                            onCheckedChange={(value) => setValue('is_active', value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? 'Enregistrement...'
                                : isEditing
                                    ? 'Mettre à jour'
                                    : 'Créer le plan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}