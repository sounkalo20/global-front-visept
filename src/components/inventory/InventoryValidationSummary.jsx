'use client';
import { CheckCircle2, XCircle, Package, TrendingDown, TrendingUp, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatCurrency = (value) => {
  const num = parseFloat(value || 0);
  if (isNaN(num)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR').format(Math.abs(Math.round(num))) + ' FCFA';
};

const JUSTIFICATION_LABELS = {
  breakage: 'Casse',
  theft: 'Vol',
  loss: 'Perte',
  found: 'Produit retrouvé',
  data_entry_error: 'Erreur de saisie',
  supplier_error: 'Erreur fournisseur',
  other: 'Autre',
};

export default function InventoryValidationSummary({ session, onValidate, onResume, isValidating }) {
  const items = session?.items || [];
  const discrepancyItems = items.filter(i => i.difference !== null && i.difference !== 0);
  const conformingItems = items.filter(i => i.difference === 0 && i.counted_qty !== null);
  const notCountedItems = items.filter(i => i.counted_qty === null);

  const totalDiscrepancyValue = discrepancyItems.reduce((sum, i) => sum + parseFloat(i.discrepancy_value || 0), 0);
  const negativeItems = discrepancyItems.filter(i => parseFloat(i.difference) < 0);
  const positiveItems = discrepancyItems.filter(i => parseFloat(i.difference) > 0);

  return (
    <div className="space-y-6">
      {/* Résumé Global */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center shadow-sm">
          <Package size={24} className="text-brand-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-gray-900">{items.length}</p>
          <p className="text-sm text-gray-500">produits contrôlés</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5 text-center shadow-sm">
          <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-emerald-700">{conformingItems.length}</p>
          <p className="text-sm text-emerald-600">conformes</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-5 text-center shadow-sm">
          <AlertTriangle size={24} className="text-red-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-red-700">{discrepancyItems.length}</p>
          <p className="text-sm text-red-600">en écart</p>
        </div>
        <div className={`rounded-xl border p-5 text-center shadow-sm ${totalDiscrepancyValue < 0 ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
          {totalDiscrepancyValue < 0 ? (
            <TrendingDown size={24} className="text-red-500 mx-auto mb-2" />
          ) : (
            <TrendingUp size={24} className="text-blue-500 mx-auto mb-2" />
          )}
          <p className={`text-2xl font-bold ${totalDiscrepancyValue < 0 ? 'text-red-700' : 'text-blue-700'}`}>
            {totalDiscrepancyValue < 0 ? '-' : '+'}{formatCurrency(totalDiscrepancyValue)}
          </p>
          <p className="text-sm text-gray-500">valeur des écarts</p>
        </div>
      </div>

      {/* Avertissements */}
      {notCountedItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{notCountedItems.length} produit(s)</strong> n'ont pas été comptés et seront exclus de l'ajustement.
          </p>
        </div>
      )}

      {/* Détail des écarts */}
      {discrepancyItems.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Détail des ajustements à effectuer</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ces stocks seront modifiés après validation</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Produit</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Avant</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Après</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Écart</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Valeur</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {discrepancyItems.map(item => {
                  const diff = parseFloat(item.difference);
                  const isNeg = diff < 0;
                  return (
                    <tr key={item.id} className={`${isNeg ? 'bg-red-50/30' : 'bg-blue-50/30'}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        {item.sku && <p className="text-xs text-gray-400">SKU: {item.sku}</p>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
                          {Number(item.theoretical_qty)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded font-bold ${isNeg ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {Number(item.counted_qty)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${isNeg ? 'text-red-600' : 'text-blue-600'}`}>
                          {isNeg ? '' : '+'}{Number(diff)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-medium ${isNeg ? 'text-red-600' : 'text-blue-600'}`}>
                          {isNeg ? '-' : '+'}{formatCurrency(item.discrepancy_value)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {JUSTIFICATION_LABELS[item.justification] || '—'}
                        </span>
                        {item.justification_note && (
                          <p className="text-xs text-gray-400 italic mt-0.5">{item.justification_note}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center">
          <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold text-emerald-800">Aucun écart détecté !</h3>
          <p className="text-sm text-emerald-600 mt-1">Tous les stocks comptés correspondent au stock théorique.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onResume}
          className="gap-2"
        >
          <RotateCcw size={16} />
          Reprendre le comptage
        </Button>
        <Button
          onClick={onValidate}
          disabled={isValidating}
          className="gap-2 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
        >
          <CheckCircle2 size={18} />
          {isValidating ? 'Validation en cours...' : 'Valider définitivement et ajuster les stocks'}
        </Button>
      </div>
    </div>
  );
}
