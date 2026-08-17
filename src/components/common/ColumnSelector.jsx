'use client';

/**
 * ColumnSelector — Composant générique de personnalisation des colonnes d'un tableau.
 *
 * Affiche un bouton avec une icône SlidersHorizontal qui ouvre un Popover
 * listant toutes les colonnes avec un toggle. Les colonnes requises sont désactivées.
 */
import { SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export default function ColumnSelector({
  columnsDef,
  visibleColumns,
  onToggle,
  onReset,
  hiddenCount = 0,
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 gap-2 text-xs font-medium border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#1F2937] text-gray-700 dark:text-[#D1D5DB] hover:bg-gray-50 dark:hover:bg-[#374151] transition-all rounded-xl shadow-xs',
            hiddenCount > 0 && 'border-brand-400 dark:border-brand-500 text-brand-600 dark:text-brand-400'
          )}
          aria-label="Personnaliser les colonnes"
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Colonnes</span>
          {hiddenCount > 0 && (
            <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-bold">
              -{hiddenCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 p-0 bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-[#374151] rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-[#374151]">
          <span className="text-xs font-semibold text-gray-700 dark:text-[#D1D5DB] uppercase tracking-wider">
            Colonnes visibles
          </span>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-[#9CA3AF] hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            title="Réinitialiser aux colonnes par défaut"
          >
            <RotateCcw size={10} />
            Réinitialiser
          </button>
        </div>

        {/* Liste des colonnes */}
        <div className="py-1.5 max-h-72 overflow-y-auto">
          {columnsDef.map((col) => {
            const isVisible = visibleColumns?.has(col.id) ?? true;
            const isRequired = col.required === true;

            return (
              <button
                key={col.id}
                onClick={() => !isRequired && onToggle(col.id)}
                disabled={isRequired}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                  isRequired
                    ? 'cursor-default opacity-50'
                    : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#374151]/60',
                  isVisible
                    ? 'text-gray-800 dark:text-[#F9FAFB]'
                    : 'text-gray-400 dark:text-[#6B7280]'
                )}
              >
                <span className="truncate">{col.label}</span>
                <span
                  className={cn(
                    'flex-shrink-0 ml-2 w-4 h-4 rounded border flex items-center justify-center transition-all',
                    isVisible
                      ? 'bg-brand-600 dark:bg-brand-500 border-brand-600 dark:border-brand-500'
                      : 'bg-transparent border-gray-300 dark:border-[#4B5563]'
                  )}
                >
                  {isVisible && <Check size={10} strokeWidth={3} className="text-white" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-3 py-2 border-t border-gray-100 dark:border-[#374151]">
          <p className="text-[10px] text-gray-400 dark:text-[#6B7280]">
            Les colonnes en grisé sont toujours affichées.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
