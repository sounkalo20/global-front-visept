// components/restaurant/SaleStatsCards.jsx
'use client';
import { ShoppingCart, DollarSign, TrendingUp, CreditCard, Utensils } from 'lucide-react';

export default function SaleStatsCards({ stats }) {
    if (!stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            label: 'Ventes du jour',
            value: stats.today?.total_sales || 0,
            sub: `Moy: ${Number(stats.today?.average_sale || 0).toLocaleString()} FCFA`,
            icon: ShoppingCart,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Revenu du jour',
            value: `${Number(stats.today?.total_revenue || 0).toLocaleString()} FCFA`,
            icon: DollarSign,
            color: 'bg-green-50 text-green-600',
        },
        {
            label: 'Revenu du mois',
            value: `${Number(stats.this_month?.total_revenue || 0).toLocaleString()} FCFA`,
            sub: `${stats.this_month?.total_sales || 0} ventes`,
            icon: TrendingUp,
            color: 'bg-purple-50 text-purple-600',
        },
        {
            label: 'Dettes en cours',
            value: `${Number(stats.debts?.total_due || 0).toLocaleString()} FCFA`,
            sub: `${stats.debts?.total_debts || 0} dette(s)`,
            icon: CreditCard,
            color: 'bg-red-50 text-red-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-xl border p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{card.label}</p>
                            <p className="text-2xl font-bold mt-1">{card.value}</p>
                            {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                            <card.icon size={20} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}