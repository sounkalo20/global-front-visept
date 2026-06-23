// components/companies/CompanyEditForm.jsx (NOUVEAU)
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
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { companiesApi } from '@/lib/api/companies';
import useCompanyStore from '@/store/companyStore';

export default function CompanyEditForm({ isOpen, onClose, company }) {
    const { updateCompany } = useCompanyStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (isOpen && company) {
            reset({
                name: company.name || '',
                description: company.description || '',
                country: company.country || '',
                city: company.city || '',
                address: company.address || '',
                phone: company.phone || '',
            });
            setLogo(null);
            setLogoPreview(company.logo_url || null);
        }
    }, [isOpen, company, reset]);

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
            if (logo) formData.append('logo', logo);

            await companiesApi.update(company.id, formData);

            // Mettre à jour le store local
            updateCompany({ ...company, ...data, logo_url: logoPreview });

            toast.success('Entreprise mise à jour.');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Modifier l'entreprise</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload size={20} className="text-gray-400" />
                                )}
                            </div>
                            <label className="cursor-pointer text-sm text-brand-600 hover:text-brand-700">
                                Changer le logo
                                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nom *</label>
                        <Input {...register('name', { required: 'Nom requis' })} error={errors.name?.message} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea rows={2} {...register('description')} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Pays</label>
                            <Input {...register('country')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ville</label>
                            <Input {...register('city')} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Adresse</label>
                        <Input {...register('address')} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Téléphone</label>
                        <Input {...register('phone')} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}