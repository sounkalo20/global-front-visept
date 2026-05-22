'use client';
import { motion } from 'framer-motion';
import { Users, UserCheck, DollarSign, TrendingUp, Star, UserPlus } from 'lucide-react';

export default function ClientStats({ stats }) {
  if (!stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-4 animate-pulse">
            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-6 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total clients', value: stats.total_clients || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Clients actifs', value: stats.active_clients || 0, icon: UserCheck, color: 'bg-green-100 text-green-600' },
    { label: 'Total dettes', value: `${parseInt(stats.total_debt || 0).toLocaleString()} F`, icon: DollarSign, color: 'bg-amber-100 text-amber-600' },
    { label: 'Nouveaux ce mois', value: stats.new_clients_this_month || 0, icon: UserPlus, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${card.color}`}><card.icon size={18} /></div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-lg font-semibold">{card.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}