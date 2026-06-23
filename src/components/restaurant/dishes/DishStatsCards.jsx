// components/restaurant/DishStatsCards.jsx
'use client';
import { Utensils, CheckCircle2, XCircle } from 'lucide-react';

export default function DishStatsCards({ stats }) {
    if (!stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        { label: 'Total plats', value: stats.total || 0, icon: Utensils, color: 'bg-blue-50 text-blue-600' },
        { label: 'Disponibles', value: stats.available || 0, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
        { label: 'Indisponibles', value: stats.unavailable || 0, icon: XCircle, color: 'bg-red-50 text-red-600' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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