// components/supplier-orders/OrderStatsCards.jsx
'use client';
import { Package, Clock, CheckCircle2, DollarSign, AlertCircle } from 'lucide-react';

export default function OrderStatsCards({ stats }) {
    if (!stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                        <div className="h-7 bg-gray-200 rounded w-1/3" />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        { label: 'Total commandes', value: stats.total || 0, icon: Package, color: 'bg-blue-50 text-blue-600' },
        { label: 'En cours', value: stats.pending || 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        { label: 'Reçues', value: stats.received || 0, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
        { label: 'Montant total', value: `${Number(stats.total_amount || 0).toLocaleString()} FCFA`, icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
        { label: 'Reste à payer', value: `${Number(stats.total_remaining || 0).toLocaleString()} FCFA`, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">{card.label}</p>
                            <p className="text-xl font-bold mt-1">{card.value}</p>
                        </div>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                            <card.icon size={18} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}