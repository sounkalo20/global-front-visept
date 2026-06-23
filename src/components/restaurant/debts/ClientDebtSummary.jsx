// components/restaurant/ClientDebtSummary.jsx
'use client';
import { useEffect, useState } from 'react';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from '@/store/companyStore';
import { User, CreditCard } from 'lucide-react';

export default function ClientDebtSummary({ onSelectClient }) {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const activeCompany = useCompanyStore((s) => s.activeCompany);

    useEffect(() => {
        if (activeCompany?.id) {
            setLoading(true);
            restaurantApi.getDebts(activeCompany.id, { limit: 200 })
                .then(r => {
                    // Regrouper par client
                    const grouped = {};
                    r.data.data.debts.forEach(d => {
                        if (!grouped[d.client_id]) {
                            grouped[d.client_id] = {
                                client_id: d.client_id,
                                client_name: d.client_name,
                                client_phone: d.client_phone,
                                total_debt: 0,
                                debts_count: 0,
                            };
                        }
                        if (d.status !== 'paid' && d.status !== 'canceled') {
                            grouped[d.client_id].total_debt += parseFloat(d.remaining_amount || 0);
                            grouped[d.client_id].debts_count += 1;
                        }
                    });
                    setClients(Object.values(grouped).filter(c => c.total_debt > 0).sort((a, b) => b.total_debt - a.total_debt));
                })
                .finally(() => setLoading(false));
        }
    }, [activeCompany]);

    if (loading) {
        return <div className="text-center py-4 text-sm text-gray-400">Chargement...</div>;
    }

    if (clients.length === 0) {
        return <div className="text-center py-4 text-sm text-gray-400">Aucun client avec une dette en cours.</div>;
    }

    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CreditCard size={14} /> Dettes par client
            </p>
            {clients.map((c) => (
                <button
                    key={c.client_id}
                    onClick={() => onSelectClient(c)}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-xl border hover:border-brand-300 hover:shadow-sm transition-all text-left"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                            <User size={14} className="text-red-500" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{c.client_name}</p>
                            <p className="text-xs text-gray-400">{c.debts_count} dette(s)</p>
                        </div>
                    </div>
                    <p className="font-bold text-red-600 text-sm">{Number(c.total_debt).toLocaleString()} FCFA</p>
                </button>
            ))}
        </div>
    );
}