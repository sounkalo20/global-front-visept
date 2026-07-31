'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, StopCircle, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import StatusBadge from '@/components/inventory/StatusBadge';
import InventoryCountTable from '@/components/inventory/InventoryCountTable';
import useInventoryStore from '@/store/inventoryStore';

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export default function InventorySessionPage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentSession, isLoading, fetchSession, completeSession, cancelSession } = useInventoryStore();
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (id) fetchSession(id);
  }, [id]);

  const handleComplete = async () => {
    if (!confirm('Terminer le comptage et passer en attente de validation ?')) return;
    setActionLoading('complete');
    try {
      await completeSession(id);
      toast.success('Comptage terminé ! Vous pouvez maintenant valider l\'inventaire.');
      router.push(`/shop/inventory/${id}/validate`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la complétion');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Annuler cet inventaire ? Cette action est irréversible.')) return;
    setActionLoading('cancel');
    try {
      await cancelSession(id);
      toast.success('Inventaire annulé');
      router.push('/shop/inventory');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading && !currentSession) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="text-red-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">Session introuvable</h2>
        <Button variant="outline" onClick={() => router.push('/shop/inventory')} className="mt-4">
          Retour aux inventaires
        </Button>
      </div>
    );
  }

  const session = currentSession;
  const isReadonly = ['validated', 'canceled', 'completed'].includes(session.status);
  const isInProgress = session.status === 'in_progress';
  const isCompleted = session.status === 'completed';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/shop/inventory')} className="gap-2">
              <ArrowLeft size={16} />
              Retour
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
                <StatusBadge status={session.status} size="lg" />
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span className="font-mono font-semibold text-brand-600">{session.reference}</span>
                <span>Créé le {formatDate(session.created_at)}</span>
                {session.started_at && <span>Démarré le {formatDate(session.started_at)}</span>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isCompleted && (
              <Button
                onClick={() => router.push(`/shop/inventory/${id}/validate`)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 size={16} />
                Voir la synthèse & Valider
              </Button>
            )}
            {isInProgress && (
              <>
                <Button
                  onClick={handleComplete}
                  disabled={actionLoading === 'complete'}
                  className="gap-2"
                >
                  <CheckCircle2 size={16} />
                  {actionLoading === 'complete' ? 'En cours...' : 'Terminer le comptage'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={actionLoading === 'cancel'}
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <StopCircle size={16} />
                  Annuler
                </Button>
              </>
            )}
            {session.notes && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border">
                <FileText size={13} />
                {session.notes}
              </div>
            )}
          </div>
        </div>

        {/* Message statut */}
        {session.status === 'validated' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Inventaire validé</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Les stocks ont été ajustés le {formatDate(session.completed_at)}.
                {session.total_discrepancies > 0 && ` ${session.total_discrepancies} ajustements effectués.`}
              </p>
            </div>
          </div>
        )}

        {session.status === 'canceled' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-500" />
            <p className="text-sm text-red-700">Cette session a été annulée. Aucun stock n'a été modifié.</p>
          </div>
        )}

        {isInProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-blue-500" />
            <p className="text-sm text-blue-700">
              <strong>Comptage en cours.</strong> Saisissez les quantités physiques réelles. 
              Cliquez <strong>"Sauver"</strong> sur chaque ligne ou l'écart sera calculé automatiquement.
              <strong> Aucun stock ne sera modifié</strong> avant la validation finale.
            </p>
          </div>
        )}

        {/* Table de comptage */}
        <InventoryCountTable session={session} readonly={isReadonly} />
      </motion.div>
    </div>
  );
}
