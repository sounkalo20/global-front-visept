'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, Minus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ModifierSelectorModal({ open, onOpenChange, dish, groups = [], onConfirm }) {
  const [selectedChoices, setSelectedChoices] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (open && groups.length > 0) {
      setQuantity(1);
      setValidationError('');

      // Pré-sélectionner par défaut si un groupe est obligatoire et min_choices == 1 et qu'il n'y a qu'une seule option
      const initial = {};
      groups.forEach((group) => {
        if (group.is_required && group.min_choices === 1 && group.options?.length === 1) {
          initial[group.id] = [group.options[0]];
        } else {
          initial[group.id] = [];
        }
      });
      setSelectedChoices(initial);
    }
  }, [open, groups]);

  if (!dish) return null;

  const handleToggleOption = (group, option) => {
    setValidationError('');
    setSelectedChoices((prev) => {
      const currentGroupChoices = prev[group.id] || [];
      const exists = currentGroupChoices.some((o) => o.id === option.id);

      if (group.max_choices === 1) {
        // Choix unique (radio style)
        if (exists && !group.is_required) {
          // Désélectionner si facultatif
          return { ...prev, [group.id]: [] };
        }
        return { ...prev, [group.id]: [option] };
      } else {
        // Choix multiple (checkbox style)
        if (exists) {
          return { ...prev, [group.id]: currentGroupChoices.filter((o) => o.id !== option.id) };
        } else {
          if (group.max_choices > 0 && currentGroupChoices.length >= group.max_choices) {
            toast.warning(`Maximum ${group.max_choices} choix pour "${group.name}".`);
            return prev;
          }
          return { ...prev, [group.id]: [...currentGroupChoices, option] };
        }
      }
    });
  };

  // Calcul du prix extra par plat
  const basePrice = Number(dish.retail_price || 0);
  const extraPrice = Object.values(selectedChoices)
    .flat()
    .reduce((sum, opt) => sum + Number(opt.extra_price || 0), 0);
  const unitTotalPrice = basePrice + extraPrice;
  const grandTotal = unitTotalPrice * quantity;

  const handleValidate = () => {
    // Vérification des exigences obligatoires
    for (const group of groups) {
      const choices = selectedChoices[group.id] || [];
      const minReq = group.is_required ? Math.max(group.min_choices, 1) : group.min_choices;
      if (choices.length < minReq) {
        const errorMsg = `Veuillez sélectionner au moins ${minReq} option(s) pour "${group.name}".`;
        setValidationError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    }

    // Aplatir les choix pour le payload
    const allChoices = groups.flatMap((group) => {
      const choices = selectedChoices[group.id] || [];
      return choices.map((opt) => ({
        modifier_group_id: group.id,
        modifier_option_id: opt.id,
        group_name: group.name,
        option_name: opt.name,
        extra_price: Number(opt.extra_price || 0),
      }));
    });

    onConfirm({
      product: dish,
      quantity,
      unitPrice: basePrice,
      extraPrice,
      totalUnitPrice: unitTotalPrice,
      modifierChoices: allChoices,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Header avec aperçu plat */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-5 shrink-0">
          <div className="flex items-center gap-3">
            {dish.image_url ? (
              <img src={dish.image_url} alt={dish.name} className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
            ) : null}
            <div>
              <h2 className="text-xl font-bold">{dish.name}</h2>
              <p className="text-orange-100 text-sm font-medium">
                Prix de base : {basePrice.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>

        {/* Groupes de modificateurs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {validationError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
              <AlertCircle size={18} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {groups.map((group) => {
            const currentChoices = selectedChoices[group.id] || [];
            const minReq = group.is_required ? Math.max(group.min_choices, 1) : group.min_choices;
            const isFulfilled = currentChoices.length >= minReq;

            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-base">{group.name}</h3>
                    {group.is_required ? (
                      <Badge variant="destructive" className="text-xs">
                        Obligatoire ({minReq})
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Facultatif
                      </Badge>
                    )}
                  </div>
                  {isFulfilled && group.is_required && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <Check size={14} /> Requis validé
                    </span>
                  )}
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options?.map((option) => {
                    const isSelected = currentChoices.some((o) => o.id === option.id);
                    const hasPrice = Number(option.extra_price) > 0;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleToggleOption(group, option)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 text-orange-950 font-medium shadow-sm ring-1 ring-orange-500'
                            : 'border-gray-200 hover:border-gray-300 bg-white text-gray-800'
                        }`}
                      >
                        <span className="text-sm">{option.name}</span>
                        <div className="flex items-center gap-2">
                          {hasPrice ? (
                            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                              +{Number(option.extra_price).toLocaleString()} FCFA
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Gratuit</span>
                          )}
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer avec quantité et total */}
        <div className="p-4 bg-gray-50 border-t shrink-0 flex items-center justify-between gap-4">
          {/* Quantité */}
          <div className="flex items-center gap-3 bg-white border rounded-xl p-1 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus size={14} />
            </Button>
            <span className="font-bold text-base w-6 text-center">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus size={14} />
            </Button>
          </div>

          {/* Bouton Ajouter */}
          <Button
            onClick={handleValidate}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 rounded-xl text-base shadow-md"
          >
            Ajouter au panier • {grandTotal.toLocaleString()} FCFA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
