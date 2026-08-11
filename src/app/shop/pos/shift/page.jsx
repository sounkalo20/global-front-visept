'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import useCompanyStore from '@/store/companyStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, ChevronDown, Wallet, Coffee } from 'lucide-react';
import { toast } from 'sonner';

export default function ShiftOpeningPage() {
    const router = useRouter();
    const activeCompany = useCompanyStore((state) => state.activeCompany);

    const [registers, setRegisters] = useState([]);
    const [selectedRegister, setSelectedRegister] = useState('');
    const [openingAmount, setOpeningAmount] = useState('0');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!activeCompany) return;

        const checkAndFetch = async () => {
            try {
                const activeRes = await api.get(`/cash/sessions/active?company_id=${activeCompany.id}`);
                if (activeRes.data.data) {
                    router.replace('/shop/sales/new');
                    return;
                }

                const regRes = await api.get(`/cash/registers?company_id=${activeCompany.id}`);
                setRegisters(regRes.data.data || []);
                if (regRes.data.data?.length > 0) {
                    setSelectedRegister(regRes.data.data[0].id.toString());
                }
            } catch (error) {
                console.error(error);
                toast.error("Impossible de charger les données de caisse.");
            } finally {
                setIsLoading(false);
            }
        };

        checkAndFetch();
    }, [activeCompany, router]);

    const handleOpenShift = async (e) => {
        e.preventDefault();
        if (!selectedRegister) {
            toast.error("Veuillez sélectionner une caisse.");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/cash/sessions/open', {
                company_id: activeCompany.id,
                cash_register_id: selectedRegister,
                opening_amount: Number(openingAmount) || 0
            });
            toast.success("Caisse ouverte avec succès !");
            router.push('/shop/sales/new');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Erreur lors de l'ouverture de la caisse.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-indigo-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-lg w-full"
            >
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden">
                    {/* Header avec design moderne */}
                    <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 pt-12 pb-16 overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 ring-1 ring-white/30 shadow-lg shadow-black/10">
                                <Coffee className="w-10 h-10 text-white" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Ouverture de caisse
                            </h1>
                            <p className="text-indigo-100/90 mt-2 text-sm font-medium">
                                Préparez votre session de travail
                            </p>
                        </div>
                    </div>

                    {/* Contenu avec espacement amélioré */}
                    <div className="px-8 pb-8 pt-6">
                        {registers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-4">
                                    <AlertCircle className="w-8 h-8 text-amber-500" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Aucune caisse disponible
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                                    Aucune caisse ne vous a été assignée. Contactez votre administrateur pour configurer votre poste de travail.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleOpenShift} className="space-y-6">
                                {/* Sélecteur de caisse */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Wallet className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                                        Caisse d'assignation
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedRegister}
                                            onChange={(e) => setSelectedRegister(e.target.value)}
                                            className="w-full h-14 px-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 font-medium appearance-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 hover:border-slate-300"
                                            required
                                        >
                                            {registers.map(reg => (
                                                <option key={reg.id} value={reg.id} className="py-2">
                                                    {reg.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" strokeWidth={1.5} />
                                    </div>
                                </div>

                                {/* Montant initial */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Fond de caisse initial
                                        <span className="ml-1 text-sm font-normal text-slate-400">(FCFA)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                                            FCFA
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={openingAmount}
                                            onChange={(e) => setOpeningAmount(e.target.value)}
                                            className="w-full h-14 px-4 pl-16 bg-slate-50 border-2 border-slate-200 rounded-2xl text-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 hover:border-slate-300"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Bouton visible et stylisé */}
                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white border-0"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Ouverture en cours...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <LogIn className="w-5 h-5" strokeWidth={2} />
                                            Ouvrir la session
                                        </span>
                                    )}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}