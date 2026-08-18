'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Info, AlertCircle, Loader2 } from 'lucide-react';

export default function BulkConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  count = 0,
  actionType = 'default', // 'activate' | 'deactivate' | 'delete' | 'change_category' | 'change_role' | 'change_status' | 'custom'
  isDestructive = false,
  confirmLabel = 'Confirmer',
  warningMessage = null,
  options = [], // For category / role / status selectors
  optionsLabel = 'Sélectionnez une option',
  showInput = false,
  inputLabel = 'Valeur',
  inputPlaceholder = 'Saisir une valeur...',
  inputRequired = false,
  isLoading = false,
}) {
  const [selectedValue, setSelectedValue] = useState('');
  const [inputText, setInputText] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedValue('');
      setInputText('');
      setReason('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm({
      value: selectedValue || inputText.trim(),
      inputValue: inputText.trim(),
      reason: reason.trim() || undefined,
    });
  };

  const requiresSelect = ['change_category', 'change_role', 'change_status'].includes(actionType);
  const requiresInput = showInput || actionType === 'input' || actionType === 'change_city';
  const isConfirmDisabled =
    isLoading ||
    (requiresSelect && (selectedValue === '' || selectedValue === undefined || selectedValue === null)) ||
    (requiresInput && inputRequired && !inputText.trim());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                  : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
              }`}
            >
              {isDestructive ? <AlertTriangle size={20} /> : <Info size={20} />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB]">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-[#D1D5DB] mt-0.5">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Badge du nombre d'éléments impactés */}
          <div className="p-3 bg-gray-50 dark:bg-[#1F2937]/60 border border-gray-200 dark:border-[#374151] rounded-xl flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-[#D1D5DB] font-medium">Éléments sélectionnés :</span>
            <span className="font-bold text-brand-600 dark:text-brand-400 px-2 py-0.5 bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-lg">
              {count} élément{count > 1 ? 's' : ''}
            </span>
          </div>

          {/* Avertissement spécial si fourni */}
          {warningMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                isDestructive
                  ? 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
                  : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
              }`}
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Sélecteur dynamique (ex: Catégories, Rôles, Statuts) */}
          {requiresSelect && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#D1D5DB]">
                {optionsLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-xl border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#111827] text-xs font-medium text-gray-900 dark:text-[#F9FAFB] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}
                >
                  <option value="" disabled className="text-gray-400 dark:text-gray-500 bg-white dark:bg-[#111827]">
                    Choisir une option...
                  </option>
                  {options.map((opt, idx) => {
                    const optVal =
                      opt.value === '' || opt.value === null || opt.value === undefined
                        ? 'none'
                        : opt.value.toString();
                    return (
                      <option
                        key={`${optVal}-${idx}`}
                        value={optVal}
                        className="text-gray-900 dark:text-[#F9FAFB] bg-white dark:bg-[#111827] py-1.5"
                      >
                        {opt.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}

          {/* Champ de saisie texte (ex: Définir la ville) */}
          {requiresInput && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#D1D5DB]">
                {inputLabel} {inputRequired && <span className="text-red-500">*</span>}
              </label>
              <Input
                placeholder={inputPlaceholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-xs text-gray-900 dark:text-[#F9FAFB]"
                autoFocus
              />
            </div>
          )}

          {/* Champ Motif (Optionnel pour suppression ou motif d'annulation) */}
          {isDestructive && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#D1D5DB]">
                Motif (optionnel)
              </label>
              <Input
                placeholder="Ex: Nettoyage saisonnier, obsolète..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] text-xs text-gray-900 dark:text-[#F9FAFB]"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-[#374151]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937] text-xs h-9 cursor-pointer"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`text-xs font-semibold h-9 px-4 cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin mr-1.5" />
                Traitement en cours...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
