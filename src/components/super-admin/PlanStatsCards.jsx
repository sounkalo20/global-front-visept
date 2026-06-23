// components/super-admin/PlanStatsCards.jsx
'use client';
import { Layers, CheckCircle2, TrendingUp, Star } from 'lucide-react';

export default function PlanStatsCards({ stats }) {
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
            label: 'Total plans',
            value: stats.total_plans || 0,
            sub: `${stats.active_plans || 0} actifs`,
            icon: Layers,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Actifs',
            value: stats.active_plans || 0,
            icon: CheckCircle2,
            color: 'bg-green-50 text-green-600',
        },
        {
            label: 'Revenu mensuel estimé',
            value: `${Number(stats.total_estimated_revenue || 0).toLocaleString()} FCFA`,
            icon: TrendingUp,
            color: 'bg-purple-50 text-purple-600',
        },
        {
            label: 'Plan le plus populaire',
            value: stats.most_popular_plan?.name || '-',
            sub: stats.most_popular_plan ? `${stats.most_popular_plan.total} entreprises` : null,
            icon: Star,
            color: 'bg-amber-50 text-amber-600',
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