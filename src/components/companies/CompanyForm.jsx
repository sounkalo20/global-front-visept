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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { companiesApi } from '@/lib/api/companies';
import useCompanyStore from '@/store/companyStore';
import { cn } from '@/lib/utils';

const companySchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères.').max(200),
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
    available: true,
  },
  {
    id: 2,
    icon: ShoppingCart,
    label: 'Supermarché',
    description: 'Gestion avancée multi-rayons et inventaire.',
    available: false,
  },
  {
    id: 3,
    icon: Utensils,
    label: 'Restaurant',
    description: 'Commandes, tables et service en salle.',
    available: true,
  },
  {
    id: 4,
    icon: Scissors,
    label: 'Salon de coiffure',
    description: 'Rendez-vous et gestion de clientèle.',
    available: false,
  },
];

export default function CompanyForm() {
  const [step, setStep] = useState(1);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addCompany } = useCompanyStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

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
      addCompany(response.data.data.company);
      toast.success('Entreprise créée avec succès !');
      //recharger la page
      router.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="mx-auto max-w-2xl">
      {/* Étapes */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                step > s
                  ? 'bg-brand-600 text-white'
                  : step === s
                    ? 'bg-brand-100 text-brand-700 border-2 border-brand-500'
                    : 'bg-gray-100 text-gray-400'
              )}
            >
              {step > s ? <Check size={16} /> : s}
            </div>
            {s < 3 && <div className={cn('h-0.5 w-8', step > s ? 'bg-brand-600' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* STEP 1 : Infos générales */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-xl border bg-white p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
              <div className="space-y-4">
                {/* <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Logo <span className="text-gray-400">(optionnel)</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                      ) : (
                        <Upload size={24} className="text-gray-400" />
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <span className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
                        Choisir une image
                      </span>
                      <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleLogoChange} className="hidden" />
                    </label>
                  </div>
                </div> */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nom de l'entreprise *</label>
                  <Input placeholder="Ex: Mon Supermarché" error={errors.name?.message} {...register('name')} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <Input placeholder="Brève description..." error={errors.description?.message} {...register('description')} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Pays</label>
                    <Input placeholder="Ex: Mali" error={errors.country?.message} {...register('country')} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Ville</label>
                    <Input placeholder="Ex: Bamako" error={errors.city?.message} {...register('city')} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Adresse</label>
                  <Input placeholder="123 Rue Principale" error={errors.address?.message} {...register('address')} />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
                  <Input placeholder="+223 00 00 00 00" error={errors.phone?.message} {...register('phone')} />
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
              className="rounded-xl border bg-white p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Type d'entreprise</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {businessTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      disabled={!type.available}
                      onClick={() => type.available && setValue('business_type_id', type.id)}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-4 text-left transition-all',
                        !type.available && 'cursor-not-allowed opacity-50 bg-gray-50',
                        selectedType === type.id && type.available
                          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className={cn(
                        'rounded-lg p-2',
                        selectedType === type.id && type.available ? 'bg-brand-100' : 'bg-gray-100'
                      )}>
                        <Icon size={24} className={cn(
                          selectedType === type.id && type.available ? 'text-brand-600' : 'text-gray-500'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {type.label}
                          {!type.available && (
                            <span className="text-xs text-orange-500 font-normal">Bientôt disponible</span>
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
              className="rounded-xl border bg-white p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nom</span>
                  <span className="font-medium">{formValues.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium">
                    {businessTypes.find((t) => t.id === selectedType)?.label || '-'}
                  </span>
                </div>
                {formValues.city && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ville</span>
                    <span className="font-medium">{formValues.city}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium text-brand-600">FREE</span>
                </div>
                {logoPreview && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Logo</span>
                    <img src={logoPreview} alt="Logo" className="h-10 w-10 rounded object-cover" />
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Création en cours...
                  </>
                ) : (
                  'Créer mon entreprise'
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ArrowLeft size={16} className="mr-2" />
              Retour
            </Button>
          ) : (
            <div />
          )}
          {step < 3 && (
            <Button type="button" onClick={nextStep}>
              Suivant
              <ArrowRight size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}