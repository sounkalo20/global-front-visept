'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  Store,
  UtensilsCrossed,
  Scissors,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAuthStore from '@/store/authStore';

const loginSchema = z.object({
  login: z.string().min(1, 'Email ou téléphone requis.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

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
    <div className="flex min-h-screen bg-stone-50">
      {/* Panneau de marque — visible à partir de lg */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-stone-900 px-12 py-12 lg:flex">
        {/* texture grille */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* lueur brand */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl" />

        <div className="relative z-10">
          <span className="text-2xl font-bold tracking-tight text-white">VISEPT</span>
        </div>

        {/* Motif signature : les entreprises d'un même compte, empilées */}
        <div className="relative z-10 flex flex-1 items-center">
          <div className="relative h-48 w-full max-w-xs">
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-8 top-7 flex h-28 w-44 -rotate-6 items-center gap-2 rounded-xl border border-white/10 bg-stone-800/80 px-4 shadow-xl backdrop-blur-sm"
            >
              <Scissors size={18} className="text-brand-300" />
              <span className="text-sm font-medium text-stone-200">Salon</span>
            </motion.div>
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -9, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute left-1/2 top-2 flex h-28 w-44 -translate-x-1/2 items-center gap-2 rounded-xl border border-white/10 bg-stone-800 px-4 shadow-2xl"
            >
              <UtensilsCrossed size={18} className="text-brand-300" />
              <span className="text-sm font-medium text-stone-200">Restaurant</span>
            </motion.div>
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute left-[56%] top-11 flex h-28 w-44 rotate-6 items-center gap-2 rounded-xl border border-white/10 bg-stone-800/80 px-4 shadow-xl backdrop-blur-sm"
            >
              <Store size={18} className="text-brand-300" />
              <span className="text-sm font-medium text-stone-200">Boutique</span>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 max-w-sm space-y-2">
          <p className="text-lg font-medium leading-snug text-white">
            Toutes vos entreprises, un seul compte.
          </p>
          <p className="text-sm text-stone-400">
            Ventes, stock, clients et équipe — gérez chaque activité depuis VISEPT.
          </p>
        </div>
      </div>

      {/* Panneau formulaire */}
      <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-12 lg:w-[56%]">
        {/* En-tête compact (mobile uniquement) */}
        <div className="mb-8 text-center lg:hidden">
          <span className="text-2xl font-bold tracking-tight text-brand-700">VISEPT</span>
          <p className="mt-1 text-sm text-stone-500">Connexion à votre espace professionnel</p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-sm">
          <motion.div variants={itemVariants} className="mb-8 hidden lg:block">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              Espace professionnel
            </span>
            <h1 className="mt-2 text-2xl font-bold text-stone-900">Connexion</h1>
            <p className="mt-1 text-sm text-stone-500">Accédez à la gestion de votre activité.</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div variants={itemVariants}>
              <label htmlFor="login" className="mb-1.5 block text-sm font-medium text-stone-700">
                Email ou téléphone
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <Input
                  id="login"
                  type="text"
                  placeholder="exemple@email.com"
                  error={errors.login?.message}
                  className="pl-10"
                  {...register('login')}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-stone-400 transition-colors hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              >
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Connexion...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <LogIn size={18} />
                      Se connecter
                    </span>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>

          <motion.div
            variants={itemVariants}
            className="mt-5 flex items-center justify-center gap-1.5 text-xs text-stone-400"
          >
            <ShieldCheck size={14} />
            Connexion sécurisée et données chiffrées
          </motion.div>

          <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-stone-500">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Créer un compte
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}