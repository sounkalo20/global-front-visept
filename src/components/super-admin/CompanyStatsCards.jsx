// components/super-admin/CompanyStatsCards.jsx
'use client';
import { Building2, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export default function CompanyStatsCards({ stats }) {
    if (!stats) return null;

    const cards = [
        {
            label: 'Total entreprises',
            value: stats.total_companies || 0,
            icon: Building2,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Actives',
            value: stats.active_companies || 0,
            icon: CheckCircle2,
            color: 'bg-green-50 text-green-600',
        },
        {
            label: 'Abonnements expirés',
            value: stats.expired_subscriptions || 0,
            icon: XCircle,
            color: 'bg-red-50 text-red-600',
        },
        {
            label: 'Nouvelles (30j)',
            value: stats.new_this_month || 0,
            icon: TrendingUp,
            color: 'bg-purple-50 text-purple-600',
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