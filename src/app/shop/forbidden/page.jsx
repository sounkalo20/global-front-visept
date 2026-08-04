'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border text-center"
            >
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={32} />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
                <p className="text-gray-500 mb-8">
                    Vous n'avez pas les permissions nécessaires pour accéder à cette page. 
                    Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur.
                </p>

                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={() => router.back()} 
                        variant="outline"
                        className="w-full flex justify-center items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Retourner à la page précédente
                    </Button>
                    <Button 
                        onClick={() => router.push('/shop/dashboard')}
                        className="w-full flex justify-center items-center gap-2 bg-brand-600 hover:bg-brand-700"
                    >
                        <Home size={18} />
                        Aller au Tableau de bord
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
