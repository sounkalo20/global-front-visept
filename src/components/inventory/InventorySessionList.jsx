'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Play, CheckCircle2, XCircle, RotateCcw, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { toast } from 'sonner';
import useInventoryStore from '@/store/inventoryStore';

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (value) => {
  const num = parseFloat(value || 0);
  if (isNaN(num)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR').format(Math.abs(Math.round(num))) + ' FCFA';
};

export default function InventorySessionList({ sessions, onRefresh }) {
  const router = useRouter();
  const { startSession, cancelSession } = useInventoryStore();
  const [loadingId, setLoadingId] = useState(null);

  const handleStart = async (session) => {
    setLoadingId(session.id);
    try {
      await startSession(session.id);
      toast.success('Inventaire démarré !');
      router.push(`/shop/inventory/${session.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du démarrage');
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (session) => {
    if (!confirm(`Annuler la session "${session.name}" ? Cette action est irréversible.`)) return;
    setLoadingId(session.id);
    try {
      await cancelSession(session.id);
      toast.success('Session annulée');
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'annulation');
    } finally {
      setLoadingId(null);
    }
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun inventaire</h3>
        <p className="text-gray-500 text-sm">Créez votre premier inventaire physique pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Référence</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nom</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Statut</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Produits</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Écarts</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Valeur écarts</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.map((session) => (
              <tr
                key={session.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                    {session.reference || `#${session.id}`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 truncate max-w-[200px]">{session.name}</p>
                  {(session.counter_first_name || session.counter_last_name) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Par {session.counter_first_name} {session.counter_last_name}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Calendar size={12} />
                    {formatDate(session.created_at)}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={session.status} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-gray-700">
                    {session.item_count || session.total_products || 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {(session.discrepancy_count || session.total_discrepancies || 0) > 0 ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {session.discrepancy_count || session.total_discrepancies}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {parseFloat(session.total_discrepancy_value || 0) !== 0 ? (
                    <span className={`text-xs font-semibold ${parseFloat(session.total_discrepancy_value) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {parseFloat(session.total_discrepancy_value) < 0 ? '-' : '+'}
                      {formatCurrency(session.total_discrepancy_value)}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {/* Voir détail */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/shop/inventory/${session.id}`)}
                      className="h-8 w-8 p-0"
                      title="Voir le détail"
                    >
                      <Eye size={15} />
                    </Button>

                    {/* Démarrer (draft) */}
                    {session.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleStart(session)}
                        disabled={loadingId === session.id}
                        className="h-8 gap-1 text-xs"
                      >
                        <Play size={12} />
                        Démarrer
                      </Button>
                    )}

                    {/* Continuer (in_progress) */}
                    {session.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/shop/inventory/${session.id}`)}
                        className="h-8 gap-1 text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        <ChevronRight size={12} />
                        Continuer
                      </Button>
                    )}

                    {/* Valider (completed) */}
                    {session.status === 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/shop/inventory/${session.id}/validate`)}
                        className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={12} />
                        Valider
                      </Button>
                    )}

                    {/* Annuler (non validé) */}
                    {['draft', 'in_progress', 'completed'].includes(session.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(session)}
                        disabled={loadingId === session.id}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                        title="Annuler"
                      >
                        <XCircle size={15} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
