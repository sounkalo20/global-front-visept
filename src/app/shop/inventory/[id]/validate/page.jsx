'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import StatusBadge from '@/components/inventory/StatusBadge';
import InventoryValidationSummary from '@/components/inventory/InventoryValidationSummary';
import InventoryCountTable from '@/components/inventory/InventoryCountTable';
import useInventoryStore from '@/store/inventoryStore';

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export default function InventoryValidatePage() {
  const router = useRouter();
  const { id } = useParams();
  const { currentSession, isLoading, fetchSession, validateSession, resumeSession } = useInventoryStore();
  const [isValidating, setIsValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (id) fetchSession(id);
  }, [id]);

  const handleValidate = async () => {
    if (!confirm('Valider définitivement cet inventaire ?\n\nLes stocks seront ajustés automatiquement. Cette action est irréversible.')) return;
    setIsValidating(true);
    try {
      const result = await validateSession(id);
      setValidated(true);
      toast.success(`Inventaire validé ! ${result.data?.total_discrepancies || 0} ajustements effectués.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setIsValidating(false);
    }
  };

  const handleResume = async () => {
    try {
      await resumeSession(id);
      toast.success('Retour au comptage');
      router.push(`/shop/inventory/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
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

  // Rediriger si session pas complétée
  if (!['completed', 'validated'].includes(session.status)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">
          Cette session n'est pas encore complétée
        </h2>
        <p className="text-gray-400 mt-1 mb-6">Terminez le comptage avant de procéder à la validation.</p>
        <Button onClick={() => router.push(`/shop/inventory/${id}`)}>
          Retourner au comptage
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/shop/inventory/${id}`)} className="gap-2">
            <ArrowLeft size={16} />
            Retour
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                {session.status === 'validated' ? 'Résultat de l\'inventaire' : 'Synthèse & Validation'}
              </h1>
              <StatusBadge status={session.status} size="lg" />
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">{session.reference} · {session.name}</p>
          </div>
        </div>

        {/* Si déjà validé : message de confirmation */}
        {session.status === 'validated' ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-800">Inventaire validé avec succès</h3>
                <p className="text-sm text-emerald-600 mt-0.5">
                  Validé le {formatDate(session.completed_at)} ·{' '}
                  <strong>{session.total_discrepancies || 0}</strong> ajustements de stock effectués
                </p>
              </div>
            </div>
            {/* Afficher le tableau en lecture seule */}
            <InventoryCountTable session={session} readonly={true} />
            <Button variant="outline" onClick={() => router.push('/shop/inventory')}>
              Retour aux inventaires
            </Button>
          </div>
        ) : (
          <>
            {/* Avertissement */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Attention :</strong> Après validation, les stocks seront ajustés définitivement et cette action ne pourra pas être annulée.
                Vérifiez soigneusement les écarts avant de confirmer.
              </p>
            </div>

            {/* Synthèse de validation */}
            <InventoryValidationSummary
              session={session}
              onValidate={handleValidate}
              onResume={handleResume}
              isValidating={isValidating}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
