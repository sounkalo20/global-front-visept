'use client';
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Calendar, Zap } from 'lucide-react';

export default function ExpenseStats({ stats }) {
  if (!stats?.overview) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-4 animate-pulse">
            <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const { overview } = stats;

  const cards = [
    {
      label: 'Dépenses du mois',
      value: `${parseInt(overview.this_month?.total || 0).toLocaleString()} FCFA`,
      sub: `${overview.this_month?.count || 0} dépense(s)`,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total global',
      value: `${parseInt(overview.total_amount || 0).toLocaleString()} FCFA`,
      sub: `${overview.total_expenses || 0} dépense(s)`,
      icon: DollarSign,
      color: 'bg-red-100 text-red-600',
    },
    {
      label: 'Dépense moyenne',
      value: `${parseInt(overview.average_amount || 0).toLocaleString()} FCFA`,
      sub: 'Par transaction',
      icon: TrendingDown,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: "Aujourd'hui",
      value: `${parseInt(overview.today?.total || 0).toLocaleString()} FCFA`,
      sub: `${overview.today?.count || 0} dépense(s)`,
      icon: Zap,
      color: 'bg-purple-100 text-purple-600',
    },
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
              <p className="text-xs text-gray-400">{card.sub}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}