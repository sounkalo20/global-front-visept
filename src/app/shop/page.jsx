'use client';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import { BarChart3, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import EmptyCompanyState from '@/components/companies/EmptyCompanyState';

const stats = [
  { label: 'Revenus du mois', value: '0 FCFA', icon: BarChart3, color: 'bg-blue-100 text-blue-600' },
  { label: 'Clients', value: '0', icon: Users, color: 'bg-green-100 text-green-600' },
  { label: 'Ventes', value: '0', icon: ShoppingCart, color: 'bg-purple-100 text-purple-600' },
  { label: 'Croissance', value: '0%', icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { activeCompany, companies } = useCompanyStore();

  // Si pas d'entreprise, afficher l'écran vide
  if (!activeCompany && companies.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <EmptyCompanyState />
      </div>
    );
  }

  if (!activeCompany) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB]">
          Bienvenue, {user?.first_name} 👋
        </h2>
        <p className="mt-1 text-gray-500 dark:text-[#D1D5DB]">
          Tableau de bord de <span className="font-medium text-brand-600 dark:text-brand-400">{activeCompany?.name}</span>
        </p>
      </motion.div>

      {/* Statistiques */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="rounded-2xl border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] p-5 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-[#F9FAFB]">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Zone mock */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-8 rounded-2xl border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] p-6 shadow-xs"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB]">Activité récente</h3>
        <p className="mt-4 text-center text-gray-400 dark:text-[#9CA3AF] py-12">
          Aucune activité pour le moment. Commencez à utiliser VISEPT !
        </p>
      </motion.div>
    </div>
  );
}