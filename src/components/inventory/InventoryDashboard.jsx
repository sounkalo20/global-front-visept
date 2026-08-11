'use client';
import { ClipboardList, TrendingDown, Calendar, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';

const formatCurrency = (value) => {
  const num = parseFloat(value || 0);
  if (isNaN(num)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR').format(Math.abs(Math.round(num))) + ' FCFA';
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export default function InventoryDashboard({ dashboard }) {
  const router = useRouter();

  if (!dashboard) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const { this_month_count, last_validated, discrepancy_stats, top_discrepancies, active_sessions } = dashboard;
  const totalDiscrepancyValue = parseFloat(discrepancy_stats?.total_discrepancy_value || 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Inventaires ce mois */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-brand-50 rounded-lg">
              <ClipboardList size={18} className="text-brand-600" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Ce mois</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{this_month_count || 0}</p>
          <p className="text-sm text-gray-500 mt-1">inventaires réalisés</p>
        </div>

        {/* Écarts ce mois */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Écarts</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{discrepancy_stats?.total_discrepancies || 0}</p>
          <p className="text-sm text-gray-500 mt-1">produits en écart</p>
        </div>

        {/* Valeur financière des écarts */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-lg ${totalDiscrepancyValue < 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <TrendingDown size={18} className={totalDiscrepancyValue < 0 ? 'text-red-500' : 'text-emerald-500'} />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Valeur</span>
          </div>
          <p className={`text-2xl font-bold ${totalDiscrepancyValue < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {totalDiscrepancyValue < 0 ? '-' : '+'}{formatCurrency(totalDiscrepancyValue)}
          </p>
          <p className="text-sm text-gray-500 mt-1">valeur des écarts</p>
        </div>

        {/* Dernier inventaire */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Calendar size={18} className="text-purple-500" />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Dernier</span>
          </div>
          <p className="text-lg font-bold text-gray-900 truncate">
            {last_validated ? formatDate(last_validated.completed_at) : 'Aucun'}
          </p>
          <p className="text-sm text-gray-500 mt-1 truncate">
            {last_validated ? last_validated.name : 'Pas encore d\'inventaire'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions actives */}
        {active_sessions && active_sessions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Sessions en cours
            </h3>
            <div className="space-y-3">
              {active_sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => router.push(`/shop/inventory/${session.id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={session.status} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{session.name}</p>
                      <p className="text-xs text-gray-400">{session.reference}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-400 group-hover:text-brand-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Top produits en écart */}
        {top_discrepancies && top_discrepancies.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Produits souvent en écart</h3>
            <div className="space-y-3">
              {top_discrepancies.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                      {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">{item.discrepancy_count}x</p>
                    <p className="text-xs text-gray-400">écarts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
