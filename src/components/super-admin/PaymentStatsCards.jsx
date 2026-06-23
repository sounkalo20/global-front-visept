// components/super-admin/PaymentStatsCards.jsx
'use client';
import { Clock, CheckCircle2, XCircle, DollarSign } from 'lucide-react';

export default function PaymentStatsCards({ payments }) {
    const pending = payments?.length || 0;
    const totalAmount = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    const cards = [
        {
            label: 'En attente',
            value: pending,
            icon: Clock,
            color: 'bg-amber-50 text-amber-600',
        },
        {
            label: 'Montant total',
            value: `${totalAmount.toLocaleString()} FCFA`,
            icon: DollarSign,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            label: 'Approuvés (session)',
            value: '-',
            icon: CheckCircle2,
            color: 'bg-green-50 text-green-600',
        },
        {
            label: 'Rejetés (session)',
            value: '-',
            icon: XCircle,
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