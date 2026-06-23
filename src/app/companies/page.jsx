// app/companies/page.jsx
'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCompanyStore from '@/store/companyStore';
import { getBasePath } from '@/lib/config/navigation';

export default function CompaniesPage() {
    const companies = useCompanyStore((s) => s.companies);
    const isLoading = useCompanyStore((s) => s.isLoading);
    const isFetched = useCompanyStore((s) => s.isFetched);
    const activeCompany = useCompanyStore((s) => s.activeCompany);
    const fetchCompanies = useCompanyStore((s) => s.fetchCompanies);
    const router = useRouter();
    const didFetch = useRef(false);

    useEffect(() => {
        if (!didFetch.current && !isFetched) {
            didFetch.current = true;
            fetchCompanies();
        }
    }, [isFetched, fetchCompanies]);

    useEffect(() => {
        if (!isLoading && isFetched && companies.length > 0) {
            const company = activeCompany || companies[0];
            const base = getBasePath(company.business_type?.code || 'SHOP');
            router.replace(`${base}/dashboard`);
        }
    }, [isLoading, isFetched, companies.length, activeCompany, router]);

    // Loading ou redirection en cours
    if (isLoading || (isFetched && companies.length > 0)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    // Non chargé encore
    if (!isFetched) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    // Empty state
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white">
            {/* ... le reste du empty state est inchangé ... */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-lg text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                    className="mx-auto mb-8 w-24 h-24 rounded-3xl bg-brand-50 flex items-center justify-center"
                >
                    <Building2 size={44} className="text-brand-600" />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-brand-100 text-brand-700">
                        <Sparkles size={14} /> Prêt à démarrer ?
                    </span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl font-bold text-gray-900 mb-3">
                    Bienvenue sur VISEPT !
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-gray-500 text-base mb-2 leading-relaxed">
                    Vous n'avez pas encore d'entreprise. Créez votre première entreprise pour commencer à gérer vos ventes, vos clients et votre stock.
                </motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mb-8 grid grid-cols-3 gap-3">
                    {[
                        { icon: '📊', label: 'Tableau de bord' },
                        { icon: '🛒', label: 'Gestion des ventes' },
                        { icon: '👥', label: 'Fidélisez vos clients' },
                    ].map((item) => (
                        <div key={item.label} className="bg-white rounded-xl border p-3 text-center">
                            <p className="text-xl mb-1">{item.icon}</p>
                            <p className="text-xs text-gray-500">{item.label}</p>
                        </div>
                    ))}
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                    <Button
                        size="lg"
                        className="text-base px-8 py-6 rounded-xl shadow-lg shadow-brand-200 hover:shadow-xl hover:shadow-brand-300 transition-all"
                        onClick={() => router.push('/companies/new')}
                    >
                        Créer mon entreprise
                        <ArrowRight size={20} className="ml-2" />
                    </Button>
                    <p className="text-xs text-gray-400 mt-3">Gratuit • Sans engagement • Configuration en 2 minutes</p>
                </motion.div>
            </motion.div>
        </div>
    );
}