'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function BulkActionBar({
  selectedCount = 0,
  totalCount = 0,
  isAllPageSelected = false,
  isGlobalSelected = false,
  onSelectAllGlobal,
  onClearSelection,
  primaryActions = [],
  secondaryActions = [],
  itemName = 'élément',
  itemPlural = 'éléments',
}) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-6 inset-x-0 z-40 flex flex-col items-center pointer-events-none px-4"
      >
        {/* Barre principale flottante */}
        <div className="pointer-events-auto flex items-center flex-wrap justify-between gap-3 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] text-gray-900 dark:text-[#F9FAFB] px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md max-w-3xl w-full">
          {/* Indicateur de sélection */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
              <CheckSquare size={18} />
            </div>
            <div>
              <span className="font-bold text-sm text-gray-900 dark:text-[#F9FAFB]">
                {selectedCount}{' '}
                <span className="font-medium text-gray-500 dark:text-[#D1D5DB]">
                  {selectedCount > 1 ? itemPlural : itemName} sélectionné{selectedCount > 1 ? 's' : ''}
                </span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {primaryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'outline'}
                  disabled={action.disabled}
                  onClick={action.onClick}
                  className={`text-xs font-semibold h-8.5 px-3 rounded-xl transition-all cursor-pointer ${
                    action.className ||
                    'border-gray-200 dark:border-[#374151] dark:text-[#F9FAFB] dark:hover:bg-[#1F2937]'
                  }`}
                >
                  {Icon && <Icon size={14} className="mr-1.5" />}
                  {action.label}
                </Button>
              );
            })}

            {/* Menu d'actions secondaires */}
            {secondaryActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold h-8.5 px-2.5 rounded-xl border-gray-200 dark:border-[#374151] dark:text-[#F9FAFB] dark:hover:bg-[#1F2937] cursor-pointer"
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#1F2937] border-gray-200 dark:border-[#374151]">
                  {secondaryActions.map((action, idx) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={idx}
                        disabled={action.disabled}
                        onClick={action.onClick}
                        className={`text-xs font-medium cursor-pointer ${
                          action.danger ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40' : 'text-gray-700 dark:text-[#F9FAFB] hover:bg-gray-100 dark:hover:bg-[#374151]'
                        }`}
                      >
                        {Icon && <Icon size={14} className="mr-2" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Bouton de désélection */}
            <div className="h-5 w-px bg-gray-200 dark:bg-[#374151] mx-1" />
            <button
              onClick={onClearSelection}
              title="Désélectionner tout"
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-400 hover:text-gray-600 dark:hover:text-[#F9FAFB] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Bannière de sélection globale (quand toute la page est sélectionnée) */}
        {isAllPageSelected && totalCount > selectedCount && !isGlobalSelected && onSelectAllGlobal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto mt-2 bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-300 text-xs px-4 py-1.5 rounded-xl shadow-md flex items-center gap-2"
          >
            <span>
              Les <strong>{selectedCount}</strong> {itemPlural} de cette page sont sélectionnés.
            </span>
            <button
              onClick={onSelectAllGlobal}
              className="underline font-bold hover:text-brand-700 dark:hover:text-brand-200 cursor-pointer ml-1"
            >
              Sélectionner les {totalCount} {itemPlural} correspondant à la recherche
            </button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
