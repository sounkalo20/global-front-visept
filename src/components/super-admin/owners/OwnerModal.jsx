'use client';
import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useSuperAdminOwnerStore from '@/store/superAdmin/superAdminOwnerStore';

const ownerSchema = z.object({
    first_name: z.string().min(1, 'Le prénom est requis'),
    last_name: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
});

export default function OwnerModal({ isOpen, onClose }) {
    const { createOwner } = useSuperAdminOwnerStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ownerSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            password: '',
        },
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const res = await createOwner({ ...data, has_unlimited_access: false }); // Pas illimité par défaut à la création
        if (res.success) {
            toast.success('Propriétaire créé avec succès !');
            reset();
            onClose();
        } else {
            toast.error(res.message);
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Créer un propriétaire</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">Prénom</Label>
                            <Input id="first_name" {...register('first_name')} />
                            {errors.first_name && (
                                <span className="text-xs text-red-500">{errors.first_name.message}</span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Nom</Label>
                            <Input id="last_name" {...register('last_name')} />
                            {errors.last_name && (
                                <span className="text-xs text-red-500">{errors.last_name.message}</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register('email')} />
                        {errors.email && (
                            <span className="text-xs text-red-500">{errors.email.message}</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" {...register('phone')} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input id="password" type="password" {...register('password')} />
                        {errors.password && (
                            <span className="text-xs text-red-500">{errors.password.message}</span>
                        )}
                        <p className="text-xs text-gray-500">
                            Veuillez communiquer ce mot de passe au propriétaire.
                        </p>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
