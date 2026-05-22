'use client';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NoCompanyState() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="rounded-full bg-amber-100 p-5 mb-6">
        <Building2 size={40} className="text-amber-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Aucune entreprise active
      </h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Veuillez sélectionner ou créer une entreprise pour gérer vos catégories.
      </p>
      <Button onClick={() => router.push('/companies')}>
        Gérer mes entreprises
        <ArrowRight size={16} className="ml-2" />
      </Button>
    </motion.div>
  );
}