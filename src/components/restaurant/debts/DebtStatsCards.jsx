// components/restaurant/DebtStatsCards.jsx
'use client';
import { CreditCard, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function DebtStatsCards({ stats }) {
    if (!stats) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        { label: 'Total restant', value: `${Number(stats.total_remaining || 0).toLocaleString()} FCFA`, icon: CreditCard, color: 'bg-red-50 text-red-600' },
        { label: 'Total payé', value: `${Number(stats.total_paid || 0).toLocaleString()} FCFA`, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
        { label: 'En retard', value: stats.overdue_count || 0, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
        { label: 'En cours', value: (stats.pending_count || 0) + (stats.partial_count || 0), icon: Clock, color: 'bg-blue-50 text-blue-600' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">{card.label}</p>
                            <p className="text-lg font-bold mt-0.5">{card.value}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                            <card.icon size={16} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}