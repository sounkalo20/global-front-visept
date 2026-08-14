'use client';
import { motion } from 'framer-motion';
import { PackageOpen, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyProductState({ onCreate, onImport }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
        >
            <div className="rounded-full bg-brand-100 p-6 mb-6">
                <PackageOpen size={48} className="text-brand-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun produit enregistré
            </h2>
            <p className="text-gray-500 mb-6 text-center max-w-md">
                Ajoutez vos produits ou importez votre catalogue Excel/CSV pour commencer à gérer votre stock et vos ventes.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
                <Button onClick={onCreate} size="lg">
                    <Plus size={20} className="mr-2" />
                    Ajouter un produit
                </Button>
                {onImport && (
                    <Button onClick={onImport} variant="outline" size="lg" className="border-brand-300 text-brand-700 hover:bg-brand-50">
                        <Upload size={18} className="mr-2 text-brand-600" />
                        Importer un catalogue
                    </Button>
                )}
            </div>
        </motion.div>
    );
}