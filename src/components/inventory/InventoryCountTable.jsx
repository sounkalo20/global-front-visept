'use client';
import { useState, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, CheckCircle, Minus, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import useInventoryStore from '@/store/inventoryStore';

const JUSTIFICATION_OPTIONS = [
  { value: '', label: 'Sélectionner une justification' },
  { value: 'breakage', label: 'Casse / Produit endommagé' },
  { value: 'theft', label: 'Vol' },
  { value: 'loss', label: 'Perte' },
  { value: 'found', label: 'Produit retrouvé' },
  { value: 'data_entry_error', label: 'Erreur de saisie précédente' },
  { value: 'supplier_error', label: 'Erreur fournisseur' },
  { value: 'other', label: 'Autre' },
];

const formatCurrency = (v) => {
  const n = parseFloat(v || 0);
  return isNaN(n) ? '0' : new Intl.NumberFormat('fr-FR').format(Math.round(Math.abs(n))) + ' FCFA';
};

function InventoryItemRow({ item, sessionId, readonly }) {
  const { updateItem } = useInventoryStore();
  const [counted, setCounted] = useState(item.counted_qty !== null && item.counted_qty !== undefined ? String(item.counted_qty) : '');
  const [justification, setJustification] = useState(item.justification || '');
  const [justificationNote, setJustificationNote] = useState(item.justification_note || '');
  const [isSaving, setIsSaving] = useState(false);
  const [localDiff, setLocalDiff] = useState(item.difference);
  const [localDiffValue, setLocalDiffValue] = useState(item.discrepancy_value);
  const [showJustification, setShowJustification] = useState(item.difference !== null && item.difference !== 0);

  const theoretical = parseFloat(item.theoretical_qty || 0);

  const handleCountedChange = (val) => {
    setCounted(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const diff = num - theoretical;
      setLocalDiff(diff);
      setLocalDiffValue(diff * parseFloat(item.unit_cost || 0));
      setShowJustification(diff !== 0);
    }
  };

  const handleSave = useCallback(async () => {
    const num = parseFloat(counted);
    if (isNaN(num) || num < 0) {
      toast.error('Quantité invalide');
      return;
    }
    setIsSaving(true);
    try {
      await updateItem(sessionId, item.id, {
        counted_qty: num,
        justification: justification || null,
        justification_note: justificationNote || null,
      });
      toast.success(`${item.product_name} : comptage enregistré`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  }, [counted, justification, justificationNote, item.id, sessionId]);

  const isCounted = counted !== '' && !isNaN(parseFloat(counted));
  const diff = localDiff ?? item.difference;
  const diffValue = localDiffValue ?? item.discrepancy_value;

  return (
    <tr className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${isCounted && diff === 0 ? 'bg-emerald-50/30' : ''}`}>
      {/* Produit */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img src={item.image_url} alt={item.product_name} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold flex-shrink-0">
              {item.product_name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{item.product_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {item.sku && <span className="text-xs text-gray-400">SKU: {item.sku}</span>}
              {item.barcode && <span className="text-xs text-gray-400">|  {item.barcode}</span>}
            </div>
            {item.category_name && (
              <span className="text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                {item.category_name}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Stock théorique */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center min-w-[48px] px-2.5 py-1 bg-gray-100 rounded-lg font-semibold text-gray-700 text-sm">
          {Number(theoretical)}
        </span>
      </td>

      {/* Quantité comptée */}
      <td className="px-4 py-3 text-center">
        {readonly ? (
          <span className={`inline-flex items-center justify-center min-w-[48px] px-2.5 py-1 rounded-lg font-semibold text-sm ${isCounted ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
            {isCounted ? Number(parseFloat(counted)) : '—'}
          </span>
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => handleCountedChange(String(Math.max(0, (parseFloat(counted) || 0) - 1)))}
              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min="0"
              step="1"
              value={counted}
              onChange={e => handleCountedChange(e.target.value)}
              onBlur={isCounted ? handleSave : undefined}
              className="w-20 text-center px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 font-medium"
              placeholder="—"
            />
            <button
              onClick={() => handleCountedChange(String((parseFloat(counted) || 0) + 1))}
              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
            >
              +
            </button>
          </div>
        )}
      </td>

      {/* Écart */}
      <td className="px-4 py-3 text-center">
        {diff === null || !isCounted ? (
          <span className="text-gray-300">—</span>
        ) : diff === 0 ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm">
            <CheckCircle size={14} /> 0
          </span>
        ) : diff > 0 ? (
          <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm">
            <TrendingUp size={14} /> +{Number(diff)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-sm">
            <TrendingDown size={14} /> {Number(diff)}
          </span>
        )}
      </td>

      {/* Valeur écart */}
      <td className="px-4 py-3 text-right">
        {diff === null || !isCounted || diff === 0 ? (
          <span className="text-gray-300 text-sm">—</span>
        ) : (
          <span className={`text-sm font-medium ${parseFloat(diffValue) < 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {parseFloat(diffValue) < 0 ? '-' : '+'}{formatCurrency(diffValue)}
          </span>
        )}
      </td>

      {/* Justification */}
      <td className="px-4 py-3">
        {showJustification && !readonly ? (
          <div className="space-y-1.5 min-w-[200px]">
            <div className="relative">
              <select
                value={justification}
                onChange={e => setJustification(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-400 appearance-none bg-white pr-7"
              >
                {JUSTIFICATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
            </div>
            {justification && (
              <input
                type="text"
                placeholder="Note (optionnel)"
                value={justificationNote}
                onChange={e => setJustificationNote(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            )}
          </div>
        ) : item.justification ? (
          <span className="text-xs text-gray-500 italic">{JUSTIFICATION_OPTIONS.find(o => o.value === item.justification)?.label || item.justification}</span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>

      {/* Enregistrer */}
      {!readonly && (
        <td className="px-4 py-3 text-right">
          {isCounted && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSaving
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              {isSaving ? '...' : 'Sauver'}
            </button>
          )}
        </td>
      )}
    </tr>
  );
}

export default function InventoryCountTable({ session, readonly = false }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | with_discrepancy | conforming | not_counted

  const items = session?.items || [];

  const filteredItems = items.filter(item => {
    const nameMatch = item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode?.toLowerCase().includes(search.toLowerCase());

    if (!nameMatch) return false;

    if (filter === 'with_discrepancy') return item.difference !== null && item.difference !== 0;
    if (filter === 'conforming') return item.difference === 0;
    if (filter === 'not_counted') return item.counted_qty === null;
    return true;
  });

  const countedCount = items.filter(i => i.counted_qty !== null).length;
  const discrepancyCount = items.filter(i => i.difference !== null && i.difference !== 0).length;

  return (
    <div className="space-y-4">
      {/* Barre de progression */}
      {!readonly && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progression du comptage</span>
            <span className="text-sm font-bold text-gray-900">{countedCount} / {items.length} produits</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${items.length > 0 ? (countedCount / items.length) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="text-emerald-600 font-medium">{countedCount} comptés</span>
            <span className="text-red-500 font-medium">{discrepancyCount} écarts</span>
            <span>{items.length - countedCount} restants</span>
          </div>
        </div>
      )}

      {/* Filtres & Recherche */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, SKU, code-barres..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'with_discrepancy', label: 'Écarts' },
            { value: 'conforming', label: 'Conformes' },
            { value: 'not_counted', label: 'Non comptés' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Produit</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Théorique</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Compté</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Écart</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Valeur écart</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Justification</th>
                {!readonly && <th className="text-right px-4 py-3 font-semibold text-gray-600">Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={readonly ? 6 : 7} className="px-4 py-12 text-center text-gray-400">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <InventoryItemRow
                    key={item.id}
                    item={item}
                    sessionId={session.id}
                    readonly={readonly}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
