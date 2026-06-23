// components/suppliers/SupplierStatsCards.jsx
'use client';
import { Truck, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';

export default function SupplierStatsCards({ stats }) {
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
            label: 'Total fournisseurs',
            value: stats.total || 0,
            sub: `${stats.active || 0} actifs`,
            icon: Truck,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Actifs',
            value: stats.active || 0,
            icon: CheckCircle2,
            color: 'bg-green-50 text-green-600',
        },
        {
            label: 'Avec dette',
            value: stats.with_debt || 0,
            icon: AlertTriangle,
            color: 'bg-amber-50 text-amber-600',
        },
        {
            label: 'Total dû',
            value: `${Number(stats.total_debt || 0).toLocaleString()} FCFA`,
            icon: DollarSign,
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