'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useCategoryStore from '@/store/categoryStore';
import useCompanyStore from '@/store/companyStore';

const categorySchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères.').max(200, 'Maximum 200 caractères.'),
  description: z.string().max(500).optional().or(z.literal('')),
});

export default function CategoryModal({ open, onOpenChange, category, onSuccess }) {
  const { addCategory, updateCategory } = useCategoryStore();
  const { activeCompany } = useCompanyStore();

  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Pré-remplir le formulaire si édition
  useEffect(() => {
    if (category) {
      reset({
        name: category.name || '',
        description: category.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [category, reset, open]);

  const onSubmit = async (data) => {
    const payload = {
      company_id: activeCompany.id,
      ...data,
    };

    let result;
    if (isEditing) {
      result = await updateCategory(category.id, payload);
    } else {
      result = await addCategory(payload);
    }

    if (result.success) {
      toast.success(isEditing ? 'Catégorie modifiée avec succès.' : 'Catégorie créée avec succès.');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de la catégorie.'
              : 'Créez une nouvelle catégorie pour organiser vos produits.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nom de la catégorie *
            </label>
            <Input
              placeholder="Ex: Vêtements, Électronique..."
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              placeholder="Description courte (optionnelle)"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  {isEditing ? 'Modification...' : 'Création...'}
                </>
              ) : isEditing ? (
                'Enregistrer'
              ) : (
                'Créer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}