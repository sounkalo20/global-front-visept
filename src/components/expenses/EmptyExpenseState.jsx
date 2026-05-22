'use client';
import { motion } from 'framer-motion';
import { Receipt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyExpenseState({ onCreate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="rounded-full bg-amber-100 p-6 mb-6">
        <Receipt size={48} className="text-amber-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune dépense enregistrée</h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        Suivez vos dépenses pour mieux contrôler votre trésorerie et optimiser vos finances.
      </p>
      <Button onClick={onCreate} size="lg">
        <Plus size={20} className="mr-2" /> Ajouter une dépense
      </Button>
    </motion.div>
  );
}