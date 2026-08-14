'use client';
import { useState } from 'react';
import { X, ClipboardList, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import useInventoryStore from '@/store/inventoryStore';
import useCategoryStore from '@/store/categoryStore';
import useCompanyStore from '@/store/companyStore';

const SCOPE_OPTIONS = [
  { value: 'all_products', label: 'Tous les produits avec gestion de stock' },
  { value: 'by_category', label: 'Par catégorie' },
  { value: 'manual', label: 'Sélection manuelle' },
];

export default function CreateInventoryModal({ isOpen, onClose, onCreated }) {
  const { createSession } = useInventoryStore();
  const { categories } = useCategoryStore();
  const { activeCompany } = useCompanyStore();

  const [form, setForm] = useState({
    name: '',
    scope_type: 'all_products',
    scope_ids: [],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Le nom de la session est requis.');
      return;
    }
    if (form.scope_type !== 'all_products' && form.scope_ids.length === 0) {
      toast.error('Veuillez sélectionner au moins un élément pour la portée choisie.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        scope_type: form.scope_type,
        notes: form.notes || undefined,
      };
      if (form.scope_type !== 'all_products') {
        payload.scope_ids = form.scope_ids;
      }

      const session = await createSession(payload);
      toast.success(`Session "${session.reference}" créée avec ${session.total_items} produits.`);
      onCreated?.(session);
      setForm({ name: '', scope_type: 'all_products', scope_ids: [], notes: '' });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#374151] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#374151]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-50 dark:bg-brand-950/60 rounded-xl">
              <ClipboardList size={20} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-[#F9FAFB]">Nouvel inventaire</h2>
              <p className="text-xs text-gray-500 dark:text-[#D1D5DB] mt-0.5">{activeCompany?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-500 dark:text-[#9CA3AF] hover:text-gray-700 dark:hover:text-[#F9FAFB] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5">
              Nom de la session <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Ex: Inventaire mensuel Juillet 2026"
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#111827] text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 dark:placeholder-[#9CA3AF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              required
            />
          </div>

          {/* Portée */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5">Portée de l'inventaire</label>
            <div className="relative">
              <select
                value={form.scope_type}
                onChange={e => handleChange('scope_type', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#111827] text-gray-900 dark:text-[#F9FAFB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none transition-all"
              >
                {SCOPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 dark:text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>

          {/* Sélection catégories */}
          {form.scope_type === 'by_category' && categories.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-2">
                Catégories à inventorier
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#111827] rounded-xl p-2 space-y-1">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1F2937]/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.scope_ids.includes(cat.id)}
                      onChange={e => {
                        const ids = e.target.checked
                          ? [...form.scope_ids, cat.id]
                          : form.scope_ids.filter(id => id !== cat.id);
                        handleChange('scope_ids', ids);
                      }}
                      className="rounded accent-brand-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-[#D1D5DB]">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-[#D1D5DB] mb-1.5">Note (optionnel)</label>
            <textarea
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Contexte, observations..."
              rows={2}
              className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#374151] bg-white dark:bg-[#111827] text-gray-900 dark:text-[#F9FAFB] placeholder-gray-400 dark:placeholder-[#9CA3AF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none transition-all"
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-3.5 text-xs text-blue-700 dark:text-blue-300">
            <strong>ℹ️ Instantané automatique :</strong> À la création, le système capture le stock théorique actuel de chaque produit. Les ventes effectuées pendant l'inventaire n'affecteront pas ces valeurs de référence.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-[#374151]">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold">
              {isSubmitting ? 'Création...' : 'Créer l\'inventaire'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
