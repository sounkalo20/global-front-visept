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
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
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

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuthStore();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

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

        {/* Motif signature : le parcours réel de mise en route */}
        <div className="relative z-10 flex flex-1 items-center">
          <ol>
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={shouldReduceMotion ? {} : { scale: [1, 1.06, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                >
                  <UserPlus size={18} />
                </motion.div>
                <div className="my-1 h-12 w-px bg-stone-700" />
              </div>
              <div className="pb-8">
                <p className="text-sm font-semibold text-white">Créer un compte</p>
                <p className="text-xs text-brand-300">Vous êtes ici</p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-700 text-stone-500">
                  <Building2 size={18} />
                </div>
                <div className="my-1 h-12 w-px bg-stone-700" />
              </div>
              <div className="pb-8">
                <p className="text-sm font-medium text-stone-300">Configurer votre entreprise</p>
                <p className="text-xs text-stone-500">Boutique, restaurant, salon…</p>
              </div>
            </li>

            <li className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-700 text-stone-500">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-300">Commencer à gérer</p>
                <p className="text-xs text-stone-500">Ventes, stock, clients, équipe</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="relative z-10 max-w-sm space-y-2">
          <p className="text-lg font-medium leading-snug text-white">Trois étapes, et c'est prêt.</p>
          <p className="text-sm text-stone-400">
            Aucune compétence technique nécessaire pour démarrer.
          </p>
        </div>
      </div>

      {/* Panneau formulaire */}
      <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-12 lg:w-[56%]">
        {/* En-tête compact (mobile uniquement) */}
        <div className="mb-8 text-center lg:hidden">
          <span className="text-2xl font-bold tracking-tight text-brand-700">VISEPT</span>
          <p className="mt-1 text-sm text-stone-500">Créer votre espace professionnel</p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-sm">
          <motion.div variants={itemVariants} className="mb-8 hidden lg:block">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              Espace professionnel
            </span>
            <h1 className="mt-2 text-2xl font-bold text-stone-900">Créer un compte</h1>
            <p className="mt-1 text-sm text-stone-500">
              Commencez à gérer votre activité en quelques minutes.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Prénom
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <Input
                    id="first_name"
                    placeholder="John"
                    error={errors.first_name?.message}
                    className="pl-10"
                    {...register('first_name')}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-stone-700">
                  Nom
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <Input
                    id="last_name"
                    placeholder="Doe"
                    error={errors.last_name?.message}
                    className="pl-10"
                    {...register('last_name')}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  error={errors.email?.message}
                  className="pl-10"
                  {...register('email')}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-stone-700">
                Téléphone <span className="text-stone-400">(optionnel)</span>
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+223 00 00 00 00"
                  error={errors.phone?.message}
                  className="pl-10"
                  {...register('phone')}
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
                  placeholder="Minimum 8 caractères"
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
                      Création...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <UserPlus size={18} />
                      Créer mon compte
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
            Vos données restent confidentielles et chiffrées
          </motion.div>

          <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-stone-500">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Se connecter
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}