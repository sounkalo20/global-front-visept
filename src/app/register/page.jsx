'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAuthStore from '@/store/authStore';

const registerSchema = z.object({
  first_name: z.string().min(2, 'Minimum 2 caractères.').max(100),
  last_name: z.string().min(2, 'Minimum 2 caractères.').max(100),
  email: z.string().email('Email invalide.').max(191),
  phone: z.string().optional(),
  password: z.string().min(8, 'Minimum 8 caractères.'),
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      toast.success('Compte créé avec succès !');
      router.push('/companies');
    } catch (error) {
      const message = error.response?.data?.message || "Erreur lors de l'inscription.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-700">VISEPT</h1>
          <p className="mt-2 text-gray-500">Créez votre compte</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Prénom</label>
                <Input placeholder="John" error={errors.first_name?.message} {...register('first_name')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
                <Input placeholder="Doe" error={errors.last_name?.message} {...register('last_name')} />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <Input type="email" placeholder="exemple@email.com" error={errors.email?.message} {...register('email')} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Téléphone <span className="text-gray-400">(optionnel)</span>
              </label>
              <Input type="tel" placeholder="+223 00 00 00 00" error={errors.phone?.message} {...register('phone')} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 caractères"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Création...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={18} />
                  Créer mon compte
                </span>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}