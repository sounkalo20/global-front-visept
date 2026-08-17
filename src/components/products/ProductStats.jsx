'use client';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';

export default function ProductStats({ products, totalProductsCount }) {
  const totalProducts = totalProductsCount ?? products.length;
  const lowStock = products.filter(
    (p) => p.manage_stock && p.current_stock > 0 && p.current_stock <= p.low_stock_threshold
  ).length;
  const outOfStock = products.filter(
    (p) => p.manage_stock && p.current_stock <= 0
  ).length;
  const totalValue = products.reduce((sum, p) => sum + p.current_stock * p.cost_price, 0);
  const avgPrice = products.length > 0
    ? products.reduce((sum, p) => sum + parseFloat(p.retail_price), 0) / products.length
    : 0;

  const stats = [
    {
      label: 'Total produits',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Stock faible',
      value: lowStock,
      icon: AlertTriangle,
      color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      warning: lowStock > 0,
    },
    {
      label: 'Valeur stock',
      value: `${totalValue.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400',
    },
    {
      label: 'Prix moyen',
      value: `${Math.round(avgPrice).toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs transition-colors ${
            stat.warning ? 'border-amber-300 dark:border-amber-700/60' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}