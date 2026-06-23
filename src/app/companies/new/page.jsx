// app/companies/new/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Store,
    ShoppingCart,
    Utensils,
    Scissors,
    Upload,
    Loader2,
    Building2,
    MapPin,
    Phone,
    FileText,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { companiesApi } from '@/lib/api/companies';
import useCompanyStore from '@/store/companyStore';
import { getBasePath } from '@/lib/config/navigation';
import { cn } from '@/lib/utils';

const companySchema = z.object({
    name: z.string().min(2, 'Le nom doit faire au moins 2 caractères.').max(200),
    description: z.string().max(500).optional().or(z.literal('')),
    country: z.string().max(100).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    address: z.string().max(255).optional().or(z.literal('')),
    phone: z.string().max(30).optional().or(z.literal('')),
    business_type_id: z.number().int().min(1).max(4),
});

const businessTypes = [
    {
        id: 1,
        icon: Store,
        label: 'Boutique',
        description: 'Gérez vos ventes, clients et stocks simplement.',
        color: 'bg-blue-50 text-blue-600 border-blue-200',
        activeColor: 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
        available: true,
    },
    {
        id: 2,
        icon: ShoppingCart,
        label: 'Supermarché',
        description: 'Gestion avancée multi-rayons et inventaire.',
        color: 'bg-violet-50 text-violet-600 border-violet-200',
        activeColor: 'border-violet-500 bg-violet-50 ring-2 ring-violet-200',
        available: false,
    },
    {
        id: 3,
        icon: Utensils,
        label: 'Restaurant',
        description: 'Commandes, tables et service en salle.',
        color: 'bg-orange-50 text-orange-600 border-orange-200',
        activeColor: 'border-orange-500 bg-orange-50 ring-2 ring-orange-200',
        available: true,
    },
    {
        id: 4,
        icon: Scissors,
        label: 'Salon de coiffure',
        description: 'Rendez-vous et gestion de clientèle.',
        color: 'bg-pink-50 text-pink-600 border-pink-200',
        activeColor: 'border-pink-500 bg-pink-50 ring-2 ring-pink-200',
        available: false,
    },
];

const steps = [
    { id: 1, label: 'Infos', icon: Building2 },
    { id: 2, label: 'Type', icon: Store },
    { id: 3, label: 'Confirmation', icon: Check },
];

export default function NewCompanyPage() {
    const [step, setStep] = useState(1);
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addCompany, setActiveCompany } = useCompanyStore();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(companySchema),
        defaultValues: {
            business_type_id: 1,
        },
    });

    const selectedType = watch('business_type_id');
    const formValues = watch();

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'image ne doit pas dépasser 5 Mo.");
                return;
            }
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleNext = async () => {
        if (step === 1) {
            const isValid = await trigger(['name']);
            if (!isValid) return;
        }
        setStep((s) => Math.min(s + 1, 3));
    };

    const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('country', data.country || '');
            formData.append('city', data.city || '');
            formData.append('address', data.address || '');
            formData.append('phone', data.phone || '');
            formData.append('business_type_id', data.business_type_id);
            if (logo) formData.append('logo', logo);

            const response = await companiesApi.create(formData);
            const newCompany = response.data.data.company;

            addCompany(newCompany);
            setActiveCompany(newCompany);

            toast.success('Entreprise créée avec succès !');

            const base = getBasePath(newCompany.business_type?.code || 'SHOP');
            router.push(`${base}/dashboard`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de la création.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedTypeData = businessTypes.find((t) => t.id === selectedType);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-2xl font-bold text-gray-900">Créez votre entreprise</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Quelques informations pour bien démarrer
                    </p>
                </motion.div>

                {/* Étapes */}
                <div className="mb-8">
                    <div className="flex items-center justify-center gap-0">
                        {steps.map((s, index) => {
                            const StepIcon = s.icon;
                            return (
                                <div key={s.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={cn(
                                                'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300',
                                                step > s.id
                                                    ? 'bg-brand-600 text-white'
                                                    : step === s.id
                                                        ? 'bg-brand-100 text-brand-700 border-2 border-brand-500'
                                                        : 'bg-gray-100 text-gray-400'
                                            )}
                                        >
                                            {step > s.id ? <Check size={18} /> : <StepIcon size={18} />}
                                        </div>
                                        <span
                                            className={cn(
                                                'text-xs mt-1.5 font-medium',
                                                step >= s.id ? 'text-gray-700' : 'text-gray-400'
                                            )}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={cn(
                                                'h-0.5 w-12 sm:w-20 mx-2 mt-[-16px] transition-colors duration-300',
                                                step > s.id ? 'bg-brand-600' : 'bg-gray-200'
                                            )}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <AnimatePresence mode="wait">
                        {/* STEP 1 : Infos générales */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Building2 size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">Informations générales</h2>
                                        <p className="text-sm text-gray-500">Identité de votre entreprise</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {/* Logo */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Logo <span className="text-gray-400 font-normal">(optionnel)</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 hover:border-gray-400 transition-colors">
                                                {logoPreview ? (
                                                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                                                ) : (
                                                    <Upload size={24} className="text-gray-400" />
                                                )}
                                            </div>
                                            <label className="cursor-pointer">
                                                <span className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                                                    <Upload size={14} />
                                                    Choisir une image
                                                </span>
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                                    onChange={handleLogoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1.5">PNG, JPG ou WebP. Max 5 Mo.</p>
                                    </div>

                                    {/* Nom */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Nom de l'entreprise <span className="text-red-400">*</span>
                                        </label>
                                        <Input
                                            placeholder="Ex: Mon Supermarché"
                                            error={errors.name?.message}
                                            {...register('name')}
                                            className="h-11"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <Textarea
                                            placeholder="Décrivez votre activité en quelques mots..."
                                            rows={3}
                                            error={errors.description?.message}
                                            {...register('description')}
                                        />
                                    </div>

                                    {/* Localisation */}
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            <MapPin size={14} className="inline mr-1.5" />
                                            Localisation
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Input placeholder="Pays (ex: Mali)" error={errors.country?.message} {...register('country')} />
                                            </div>
                                            <div>
                                                <Input placeholder="Ville (ex: Bamako)" error={errors.city?.message} {...register('city')} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Adresse & Téléphone */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Adresse</label>
                                            <Input placeholder="123 Rue Principale" error={errors.address?.message} {...register('address')} />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                                <Phone size={14} className="inline mr-1.5" />
                                                Téléphone
                                            </label>
                                            <Input placeholder="+223 00 00 00 00" error={errors.phone?.message} {...register('phone')} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 : Type d'entreprise */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                                        <Store size={20} className="text-brand-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">Type d'entreprise</h2>
                                        <p className="text-sm text-gray-500">Choisissez votre secteur d'activité</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {businessTypes.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = selectedType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                disabled={!type.available}
                                                onClick={() => type.available && setValue('business_type_id', type.id)}
                                                className={cn(
                                                    'flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200',
                                                    !type.available && 'cursor-not-allowed opacity-50 bg-gray-50',
                                                    isSelected && type.available
                                                        ? type.activeColor
                                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'rounded-xl p-2.5 transition-colors',
                                                        isSelected && type.available ? 'bg-white/60' : 'bg-gray-100'
                                                    )}
                                                >
                                                    <Icon size={22} className={isSelected && type.available ? type.color.split(' ')[1] : 'text-gray-500'} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                                        {type.label}
                                                        {!type.available && (
                                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-normal">
                                                                Bientôt
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 : Confirmation */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                        <Check size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">Confirmation</h2>
                                        <p className="text-sm text-gray-500">Vérifiez les informations avant de créer</p>
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-xl bg-gray-50 p-5">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Nom</span>
                                        <span className="font-medium text-sm">{formValues.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Type</span>
                                        <span className="font-medium text-sm flex items-center gap-2">
                                            {selectedTypeData && <selectedTypeData.icon size={16} />}
                                            {selectedTypeData?.label || '-'}
                                        </span>
                                    </div>
                                    {formValues.description && (
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">Description</span>
                                            <span className="font-medium text-sm text-right max-w-[60%] truncate">
                                                {formValues.description}
                                            </span>
                                        </div>
                                    )}
                                    {formValues.city && (
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">Ville</span>
                                            <span className="font-medium text-sm">{formValues.city}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-500 text-sm">Plan</span>
                                        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                                            <Sparkles size={12} />
                                            Gratuit
                                        </span>
                                    </div>
                                    {logoPreview && (
                                        <div className="flex justify-between items-center py-2 border-t border-gray-100">
                                            <span className="text-gray-500 text-sm">Logo</span>
                                            <img src={logoPreview} alt="Logo" className="h-10 w-10 rounded-lg object-cover border" />
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" className="w-full mt-6 h-12 text-base" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin mr-2" />
                                            Création en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} className="mr-2" />
                                            Créer mon entreprise
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="mt-6 flex justify-between">
                        {step > 1 ? (
                            <Button type="button" variant="outline" size="lg" onClick={handlePrev}>
                                <ArrowLeft size={16} className="mr-2" />
                                Retour
                            </Button>
                        ) : (
                            <div />
                        )}
                        {step < 3 && (
                            <Button type="button" size="lg" onClick={handleNext}>
                                Continuer
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}