'use client';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, TrendingUp, Users, Calendar } from 'lucide-react';

export default function DebtStats({ stats }) {
  if (!stats) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-4 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total dettes', value: stats.total_debts || 0, icon: DollarSign, color: 'bg-blue-100 text-blue-600' },
    { label: 'Montant total dû', value: `${parseInt(stats.total_remaining || 0).toLocaleString()} F`, icon: TrendingUp, color: 'bg-red-100 text-red-600' },
    { label: 'En retard', value: stats.overdue_count || 0, icon: AlertCircle, color: 'bg-orange-100 text-orange-600', warn: stats.overdue_count > 0 },
    { label: 'Dettes payées', value: stats.paid_count || 0, icon: Calendar, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-xl border bg-white p-4 shadow-sm ${card.warn ? 'border-orange-300' : ''}`}
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