'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function BulkResultModal({
  isOpen,
  onClose,
  result,
  title = "Résultat de l'opération en masse",
}) {
  if (!result) return null;

  const {
    total_requested = 0,
    success_count = 0,
    skipped_count = 0,
    failed_count = 0,
    results = [],
    message = '',
  } = result;

  const skippedOrFailed = results.filter((r) => r.status === 'skipped' || r.status === 'failed');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                failed_count > 0
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                  : skipped_count > 0
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                  : 'bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400'
              }`}
            >
              {failed_count > 0 ? (
                <XCircle size={22} />
              ) : skipped_count > 0 ? (
                <AlertTriangle size={22} />
              ) : (
                <CheckCircle2 size={22} />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-[#D1D5DB] mt-0.5">
                {message || `${success_count} sur ${total_requested} éléments ont été traités.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Cartes de compteurs */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 rounded-xl text-center">
              <div className="text-lg font-bold text-green-700 dark:text-green-400">
                {success_count}
              </div>
              <div className="text-[11px] font-semibold text-green-600 dark:text-green-300">
                Réussi(s)
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-center">
              <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {skipped_count}
              </div>
              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-300">
                Ignoré(s)
              </div>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-center">
              <div className="text-lg font-bold text-red-700 dark:text-red-400">
                {failed_count}
              </div>
              <div className="text-[11px] font-semibold text-red-600 dark:text-red-300">
                Échec(s)
              </div>
            </div>
          </div>

          {/* Liste détaillée des éléments ignorés ou en échec */}
          {skippedOrFailed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#D1D5DB]">
                <Info size={14} className="text-gray-400 dark:text-[#9CA3AF]" />
                Détails des éléments ignorés ou non modifiés :
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 dark:border-[#374151] rounded-xl p-2.5 bg-gray-50/60 dark:bg-[#1F2937]/40">
                {skippedOrFailed.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-lg text-xs flex items-start gap-2"
                  >
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                        item.status === 'failed'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {item.name ? item.name : `#${item.id}`}
                    </span>
                    <span className="text-gray-600 dark:text-[#D1D5DB] leading-tight">
                      {item.reason || item.message || 'Non éligible à cette opération'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-[#374151]">
          <Button
            type="button"
            onClick={onClose}
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold h-9 px-5 rounded-xl"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
