'use client';
import { motion } from 'framer-motion';
import { DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyDebtState({ onCreate }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-full bg-brand-100 p-6 mb-6"><DollarSign size={48} className="text-brand-600" /></div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune dette enregistrée</h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">Créez une vente à crédit pour suivre les dettes de vos clients.</p>
      <Button onClick={onCreate} size="lg"><Plus size={20} className="mr-2" /> Nouvelle vente à crédit</Button>
    </motion.div>
  );
}