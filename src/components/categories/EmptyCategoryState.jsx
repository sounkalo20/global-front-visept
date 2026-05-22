'use client';
import { motion } from 'framer-motion';
import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyCategoryState({ onCreate }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
        >
            <div className="rounded-full bg-brand-100 p-5 mb-6">
                <FolderOpen size={40} className="text-brand-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune catégorie disponible
            </h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">
                Commencez par créer votre première catégorie pour organiser vos produits.
            </p>
            <Button onClick={onCreate}>
                <Plus size={18} className="mr-2" />
                Créer une catégorie
            </Button>
        </motion.div>
    );
}