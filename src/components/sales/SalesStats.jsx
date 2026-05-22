'use client';
import { motion } from 'framer-motion';
import { ShoppingCart, DollarSign, TrendingUp, Package } from 'lucide-react';

export default function SalesStats({ stats }) {
    if (!stats) return null;

    const cards = [
        {
            label: 'Ventes du jour',
            value: stats.today?.total_sales || 0,
            subtitle: `${parseInt(stats.today?.total_revenue || 0).toLocaleString()} FCFA`,
            icon: ShoppingCart,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            label: 'Ventes du mois',
            value: stats.this_month?.total_sales || 0,
            subtitle: `${parseInt(stats.this_month?.total_revenue || 0).toLocaleString()} FCFA`,
            icon: TrendingUp,
            color: 'bg-green-100 text-green-600',
        },
        {
            label: 'Dettes en cours',
            value: stats.debts?.total_debts || 0,
            subtitle: `${parseInt(stats.debts?.total_due || 0).toLocaleString()} FCFA`,
            icon: DollarSign,
            color: 'bg-amber-100 text-amber-600',
        },
        {
            label: 'Top produit',
            value: stats.top_products?.[0]?.name || '-',
            subtitle: stats.top_products?.[0] ? `${stats.top_products[0].total_sold} vendus` : '',
            icon: Package,
            color: 'bg-purple-100 text-purple-600',
        },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {cards.map((card, index) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border bg-white p-4 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${card.color}`}>
                            <card.icon size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">{card.label}</p>
                            <p className="text-lg font-semibold">{card.value}</p>
                            {card.subtitle && <p className="text-xs text-gray-400">{card.subtitle}</p>}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}