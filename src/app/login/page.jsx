'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAuthStore from '@/store/authStore';

const loginSchema = z.object({
  login: z.string().min(1, 'Email ou téléphone requis.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // app/login/page.jsx (modifier uniquement la fonction onSubmit)
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await login(data);
      toast.success('Connexion réussie !');

      if (response.data.user.is_super_admin) {
        router.push('/super_admin/dashboard');
      } else {
        // Rediriger vers la page companies qui décidera automatiquement
        router.push('/companies');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-700">VISEPT</h1>
          <p className="mt-2 text-gray-500">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email ou Téléphone
              </label>
              <Input
                type="text"
                placeholder="exemple@email.com"
                error={errors.login?.message}
                {...register('login')}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} />
                  Se connecter
                </span>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Créer un compte
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}