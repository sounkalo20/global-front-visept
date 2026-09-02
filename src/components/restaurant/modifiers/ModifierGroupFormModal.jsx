'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import useRestaurantModifierStore from '@/store/restaurantModifierStore';

const emptyOption = () => ({ name: '', extra_price: 0, is_active: true });

export default function ModifierGroupFormModal({ open, onOpenChange, group }) {
  const { createGroup, updateGroup } = useRestaurantModifierStore();
  const isEdit = !!group;

  const [form, setForm] = useState({
    name: '',
    description: '',
    is_required: false,
    min_choices: 0,
    max_choices: 1,
    sort_order: 0,
  });
  const [options, setOptions] = useState([emptyOption()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire quand on ouvre en mode édition
  useEffect(() => {
    if (group && open) {
      setForm({
        name: group.name || '',
        description: group.description || '',
        is_required: !!group.is_required,
        min_choices: group.min_choices ?? 0,
        max_choices: group.max_choices ?? 1,
        sort_order: group.sort_order ?? 0,
      });
      setOptions(
        group.options && group.options.length > 0
          ? group.options.map(o => ({
              id: o.id,
              name: o.name,
              extra_price: parseFloat(o.extra_price) || 0,
              is_active: o.is_active !== 0,
            }))
          : [emptyOption()]
      );
    } else if (!group && open) {
      setForm({ name: '', description: '', is_required: false, min_choices: 0, max_choices: 1, sort_order: 0 });
      setOptions([emptyOption()]);
    }
  }, [group, open]);

  const handleOptionChange = (index, field, value) => {
    setOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addOption = () => setOptions(prev => [...prev, emptyOption()]);

  const removeOption = (index) => {
    if (options.length === 1) return;
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le nom du groupe est requis.'); return; }

    const validOptions = options.filter(o => o.name.trim() !== '');
    const payload = {
      ...form,
      min_choices: parseInt(form.min_choices) || 0,
      max_choices: parseInt(form.max_choices) || 1,
      options: validOptions.map((o, i) => ({ ...o, sort_order: i })),
    };

    setIsSubmitting(true);
    const result = isEdit
      ? await updateGroup(group.id, payload)
      : await createGroup(payload);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEdit ? 'Groupe mis à jour.' : 'Groupe créé.');
      onOpenChange(false);
    } else {
      toast.error(result.message || 'Une erreur est survenue.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 pb-4 border-b">
          <DialogTitle className="text-lg font-bold">
            {isEdit ? `Modifier "${group?.name}"` : 'Nouveau groupe de modificateurs'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Nom & Description */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du groupe <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Cuisson, Accompagnement, Suppléments…"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Décrivez ce groupe…"
                />
              </div>
            </div>

            {/* Règles de sélection */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h4 className="font-medium text-gray-800 text-sm">Règles de sélection</h4>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_required}
                  onChange={e => setForm(f => ({
                    ...f,
                    is_required: e.target.checked,
                    min_choices: e.target.checked ? Math.max(f.min_choices, 1) : 0,
                  }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-800">Choix obligatoire</span>
                  <p className="text-xs text-gray-500">
                    Le client doit sélectionner au moins une option avant de valider.
                  </p>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum de choix</label>
                  <Input
                    type="number" min="0"
                    value={form.min_choices}
                    onChange={e => setForm(f => ({ ...f, min_choices: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum de choix
                    <span className="ml-1 text-xs text-gray-400">(0 = illimité)</span>
                  </label>
                  <Input
                    type="number" min="0"
                    value={form.max_choices}
                    onChange={e => setForm(f => ({ ...f, max_choices: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 text-sm">
                  Options
                  <span className="ml-2 text-xs text-gray-400">({options.filter(o => o.name).length} renseignées)</span>
                </h4>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus size={14} className="mr-1" /> Ajouter
                </Button>
              </div>

              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white border rounded-xl">
                    <GripVertical size={16} className="text-gray-300 shrink-0" />

                    <Input
                      className="flex-1"
                      placeholder="Nom de l'option (ex: Saignant, Frites…)"
                      value={opt.name}
                      onChange={e => handleOptionChange(idx, 'name', e.target.value)}
                    />

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-gray-500">+</span>
                      <Input
                        type="number" min="0" step="50"
                        className="w-28 text-right"
                        placeholder="0 FCFA"
                        value={opt.extra_price}
                        onChange={e => handleOptionChange(idx, 'extra_price', parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">FCFA</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      disabled={options.length === 1}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Laissez le prix à 0 pour les options gratuites.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 bg-white border-t shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white">
              {isSubmitting ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer le groupe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
