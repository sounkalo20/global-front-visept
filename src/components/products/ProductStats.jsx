'use client';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';

export default function ProductStats({ products }) {
  const totalProducts = products.length;
  const lowStock = products.filter(
    (p) => p.manage_stock && p.current_stock > 0 && p.current_stock <= p.low_stock_threshold
  ).length;
  const outOfStock = products.filter(
    (p) => p.manage_stock && p.current_stock <= 0
  ).length;
  const totalValue = products.reduce((sum, p) => sum + p.current_stock * p.cost_price, 0);
  const avgPrice = totalProducts > 0
    ? products.reduce((sum, p) => sum + parseFloat(p.retail_price), 0) / totalProducts
    : 0;

  const stats = [
    {
      label: 'Total produits',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Stock faible',
      value: lowStock,
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-600',
      warning: lowStock > 0,
    },
    {
      label: 'Valeur stock',
      value: `${totalValue.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Prix moyen',
      value: `${Math.round(avgPrice).toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
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
          className={`rounded-xl border bg-white p-4 shadow-sm ${stat.warning ? 'border-amber-300' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}