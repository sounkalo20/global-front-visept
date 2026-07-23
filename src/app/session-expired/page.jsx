'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, LogIn, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';

export default function SessionExpiredPage() {
  const router = useRouter();
  const setSessionExpired = useAuthStore((state) => state.setSessionExpired);

  const handleReconnect = () => {
    setSessionExpired(false);
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-xl shadow-stone-200/50"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 ring-8 ring-orange-50">
          <ShieldAlert className="h-10 w-10 text-orange-600" />
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-tight text-stone-900">
          Votre session a expiré
        </h1>
        
        <p className="mb-8 text-sm leading-relaxed text-stone-500">
          Pour des raisons de sécurité, votre session n'est plus valide ou a expiré suite à une inactivité prolongée. Veuillez vous reconnecter pour continuer à utiliser VISEPT.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleReconnect}
            className="w-full h-12 text-base font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Se reconnecter
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-stone-400">
          <Clock className="h-4 w-4" />
          VISEPT sécurise automatiquement vos données
        </div>
      </motion.div>
    </div>
  );
}
