'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sliders, Check } from 'lucide-react';
import { toast } from 'sonner';
import useRestaurantModifierStore from '@/store/restaurantModifierStore';

export default function DishModifierAssignerModal({ open, onOpenChange, dish }) {
  const { groups, fetchGroups, getDishModifiers, setDishModifiers } = useRestaurantModifierStore();
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && dish) {
      setIsLoading(true);
      fetchGroups();
      getDishModifiers(dish.id).then((res) => {
        if (res.success) {
          setSelectedGroupIds(res.groups.map((g) => g.id));
        }
        setIsLoading(false);
      });
    }
  }, [open, dish]);

  const toggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSave = async () => {
    if (!dish) return;
    setIsSaving(true);
    const groupEntries = selectedGroupIds.map((id, index) => ({ id, sort_order: index }));
    const res = await setDishModifiers(dish.id, groupEntries);
    setIsSaving(false);
    if (res.success) {
      toast.success('Modificateurs associés au plat.');
      onOpenChange(false);
    } else {
      toast.error(res.message || 'Erreur lors de la sauvegarde.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sliders size={20} className="text-orange-500" />
            Modificateurs de "{dish?.name}"
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-gray-500 mb-4">
            Cochez les groupes de modificateurs applicables à ce plat (ex: Cuisson, Accompagnement, Suppléments).
          </p>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          ) : groups.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">
              Aucun groupe de modificateurs configuré. Allez dans <strong>Carte & Menu → Modificateurs</strong> pour en créer.
            </p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {groups.map((group) => {
                const isSelected = selectedGroupIds.includes(group.id);
                return (
                  <div
                    key={group.id}
                    onClick={() => toggleGroup(group.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{group.name}</span>
                        {group.is_required ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Obligatoire</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Facultatif</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {group.options_count || group.options?.length || 0} option(s)
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                        isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
