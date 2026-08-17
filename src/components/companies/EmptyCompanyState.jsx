'use client';
import { motion } from 'framer-motion';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function EmptyCompanyState() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="rounded-full bg-brand-50 dark:bg-brand-950/60 p-6 mb-6">
        <Building2 size={48} className="text-brand-600 dark:text-brand-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-[#F9FAFB] mb-2">
        Vous n'avez encore aucune entreprise
      </h2>
      <p className="text-gray-500 dark:text-[#D1D5DB] mb-6 text-center max-w-md">
        Créez votre première entreprise pour commencer à utiliser VISEPT et gérer votre activité.
      </p>
      <Button onClick={() => router.push('/dashboard/companies/new')} size="lg" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold">
        <Plus size={20} className="mr-2" />
        Créer ma première entreprise
      </Button>
    </motion.div>
  );
}