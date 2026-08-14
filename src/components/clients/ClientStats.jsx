'use client';
import { motion } from 'framer-motion';
import { Users, UserCheck, DollarSign, TrendingUp, Star, UserPlus } from 'lucide-react';

export default function ClientStats({ stats }) {
  if (!stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse">
            <div className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded mb-2" />
            <div className="h-6 w-12 bg-gray-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total clients', value: stats.total_clients || 0, icon: Users, color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' },
    { label: 'Clients actifs', value: stats.active_clients || 0, icon: UserCheck, color: 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400' },
    { label: 'Total dettes', value: `${parseInt(stats.total_debt || 0).toLocaleString()} F`, icon: DollarSign, color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
    { label: 'Nouveaux ce mois', value: stats.new_clients_this_month || 0, icon: UserPlus, color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${card.color}`}><card.icon size={18} /></div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">{card.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{card.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}