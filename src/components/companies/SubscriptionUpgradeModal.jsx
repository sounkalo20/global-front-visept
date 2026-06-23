// components/companies/SubscriptionUpgradeModal.jsx (NOUVEAU)
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, Crown, Info, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { companiesApi } from '@/lib/api/companies';
import useSuperAdminPlanStore from '@/store/superAdmin/superAdminPlanStore';
import { cn } from '@/lib/utils';

export default function SubscriptionUpgradeModal({ isOpen, onClose, company }) {
    const { plans, fetchPlans } = useSuperAdminPlanStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        defaultValues: {
            plan_id: '',
            payment_method: 'mobile_money',
            payment_reference: '',
            notes: '',
        },
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    useEffect(() => {
        if (isOpen) {
            reset({
                plan_id: '',
                payment_method: 'mobile_money',
                payment_reference: '',
                notes: '',
            });
            setProofFile(null);
            setSelectedPlan(null);
        }
    }, [isOpen, reset]);

    const handlePlanChange = (planId) => {
        setValue('plan_id', planId);
        const plan = plans.find(p => p.id === parseInt(planId));
        setSelectedPlan(plan);
    };

    const handleFileChange = (e) => {
        setProofFile(e.target.files[0]);
    };

    const onSubmit = async (data) => {
        if (selectedPlan && selectedPlan.price_monthly > 0 && !proofFile) {
            toast.error('La preuve de paiement est requise pour un plan payant.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('plan_id', data.plan_id);
            formData.append('payment_method', data.payment_method);
            formData.append('payment_reference', data.payment_reference || '');
            formData.append('notes', data.notes || '');
            if (proofFile) formData.append('image', proofFile);

            await companiesApi.requestUpgrade(company.id, formData);
            toast.success('Demande de changement d\'abonnement soumise. Elle sera traitée par un administrateur.');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la demande.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentPlan = plans.find(p => p.id === company?.subscription_plan_id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Crown size={20} className="text-amber-500" />
                        Changer de plan d'abonnement
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        Entreprise : <strong>{company?.name}</strong>
                        {currentPlan && <span> • Plan actuel : <strong>{currentPlan.name}</strong></span>}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Sélection du plan */}
                    <div>
                        <label className="block text-sm font-medium mb-3">Choisissez un plan</label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {plans.filter(p => p.is_active).map((plan) => {
                                const isCurrent = plan.id === company?.subscription_plan_id;
                                const isSelected = watch('plan_id') === String(plan.id);
                                const features = plan.features
                                    ? (typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features)
                                    : {};

                                return (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        disabled={isCurrent}
                                        onClick={() => handlePlanChange(String(plan.id))}
                                        className={cn(
                                            'text-left rounded-xl border p-4 transition-all duration-200',
                                            isCurrent && 'opacity-50 cursor-not-allowed bg-gray-50',
                                            isSelected && !isCurrent && 'border-brand-500 bg-brand-50 ring-2 ring-brand-200',
                                            !isSelected && !isCurrent && 'border-gray-200 hover:border-gray-300'
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">{plan.name}</span>
                                            {isCurrent && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Actuel</span>
                                            )}
                                            {isSelected && !isCurrent && (
                                                <CheckCircle2 size={18} className="text-brand-600" />
                                            )}
                                        </div>
                                        <p className="text-2xl font-bold mb-1">
                                            {Number(plan.price_monthly).toLocaleString()}
                                            <span className="text-sm font-normal text-gray-500"> FCFA/mois</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mb-2">
                                            {Number(plan.price_yearly).toLocaleString()} FCFA/an
                                        </p>

                                        {/* Features */}
                                        <div className="space-y-1">
                                            {Object.entries(features).slice(0, 4).map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-1.5 text-xs">
                                                    {value ? (
                                                        <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                                                    ) : (
                                                        <XCircle size={12} className="text-red-400 shrink-0" />
                                                    )}
                                                    <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Limites */}
                                        <div className="mt-2 pt-2 border-t text-xs text-gray-500 space-y-0.5">
                                            <p>👥 Employés : {plan.max_employees ?? '∞'}</p>
                                            <p>📦 Produits : {plan.max_products ?? '∞'}</p>
                                            <p>👤 Clients : {plan.max_clients ?? '∞'}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Paiement (si plan payant sélectionné) */}
                    {selectedPlan && selectedPlan.price_monthly > 0 && (
                        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 space-y-3">
                            <div className="flex items-center gap-2 text-amber-700">
                                <Info size={16} />
                                <span className="text-sm font-medium">
                                    Montant à payer : {Number(selectedPlan.price_monthly).toLocaleString()} FCFA
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Méthode de paiement *</label>
                                <Select value={watch('payment_method')} onValueChange={(v) => setValue('payment_method', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                        <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                                        <SelectItem value="cash">Espèces</SelectItem>
                                        <SelectItem value="other">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Référence de paiement</label>
                                <Input placeholder="N° de transaction..." {...register('payment_reference')} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Preuve de paiement *</label>
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                                        <Upload size={14} />
                                        {proofFile ? proofFile.name : 'Téléverser la preuve'}
                                        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                                    </label>
                                    {proofFile && (
                                        <span className="text-xs text-green-600">✓ Fichier sélectionné</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Capture d'écran ou reçu du paiement. PNG, JPG ou PDF max 10 Mo.</p>
                            </div>
                        </div>
                    )}

                    {/* Plan gratuit */}
                    {selectedPlan && selectedPlan.price_monthly <= 0 && (
                        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                            <p className="text-sm text-green-700 flex items-center gap-2">
                                <Info size={16} />
                                Le plan Gratuit ne nécessite aucun paiement.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes (optionnel)</label>
                        <Input placeholder="Informations complémentaires..." {...register('notes')} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={isSubmitting || !watch('plan_id')}>
                            {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                            Soumettre la demande
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}