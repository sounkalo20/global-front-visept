'use client';
import { useState } from 'react';
import { Search, Loader2, Package, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useCompanyStore from '@/store/companyStore';

const RETURN_REASONS = [
  { value: 'defective', label: 'Produit défectueux' },
  { value: 'wrong_item', label: 'Mauvais article' },
  { value: 'not_satisfied', label: 'Client non satisfait' },
  { value: 'other', label: 'Autre raison' },
];

export default function PosReturnModal({ open, onOpenChange }) {
  const { activeCompany } = useCompanyStore();
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sale, setSale] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const reset = () => {
    setSearchValue('');
    setSale(null);
    setSelectedItems({});
    setNotes('');
    setSuccess(null);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    setIsSearching(true);
    setSale(null);
    setSelectedItems({});
    try {
      const res = await api.get('/sales', {
        params: { company_id: activeCompany.id, search: searchValue.trim(), limit: 5 }
      });
      const sales = res.data.data?.sales || [];
      if (sales.length === 0) {
        toast.error('Aucune vente trouvée avec ce numéro.');
        return;
      }
      // Charger le détail de la vente (items)
      const detailRes = await api.get(`/sales/${sales[0].id}`, {
        params: { company_id: activeCompany.id }
      });
      const saleDetail = detailRes.data.data?.sale;
      if (!saleDetail) { toast.error('Vente introuvable.'); return; }
      setSale(saleDetail);
      // Initialiser la sélection à 0 pour chaque item
      const init = {};
      (saleDetail.items || []).forEach(item => {
        init[item.id] = { qty: 0, return_type: 'reintegrable', reason: 'defective', maxQty: item.remaining_qty ?? item.quantity };
      });
      setSelectedItems(init);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de la recherche.');
    } finally {
      setIsSearching(false);
    }
  };

  const updateItem = (itemId, field, value) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const totalRefund = sale ? (sale.items || []).reduce((sum, item) => {
    const sel = selectedItems[item.id];
    return sum + (sel?.qty > 0 ? sel.qty * Number(item.unit_price) : 0);
  }, 0) : 0;

  const itemsToReturn = sale ? (sale.items || []).filter(item => (selectedItems[item.id]?.qty || 0) > 0) : [];

  const handleSubmit = async () => {
    if (itemsToReturn.length === 0) {
      toast.error('Sélectionnez au moins un article à retourner.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        company_id: activeCompany.id,
        sale_id: sale.id,
        notes: notes || null,
        items: itemsToReturn.map(item => ({
          sale_item_id: item.id,
          quantity: selectedItems[item.id].qty,
          return_type: selectedItems[item.id].return_type,
          reason: selectedItems[item.id].reason,
        }))
      };
      const res = await api.post('/returns', payload);
      setSuccess({
        returnNumber: res.data.data?.return_number,
        totalRefund,
        saleNumber: sale.sale_number,
      });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors du retour.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw size={20} className="text-orange-500" />
            Retour Produit
          </DialogTitle>
          <DialogDescription>
            Recherchez une vente par son numéro pour initier un retour.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          /* ─── Écran de succès ─── */
          <div className="flex flex-col items-center py-8 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Retour enregistré !</h3>
            <p className="text-gray-500 text-sm">N° {success.returnNumber}</p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-6 py-4">
              <p className="text-sm text-orange-700">Remboursement à effectuer</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {totalRefund.toLocaleString()} FCFA
              </p>
              <p className="text-xs text-orange-500 mt-1">Vente {success.saleNumber}</p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={reset}>Nouveau retour</Button>
              <Button onClick={handleClose}>Fermer</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ─── Recherche ─── */}
            <div className="flex gap-2">
              <Input
                placeholder="Numéro de vente (ex: VNT-202608-00001)"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching || !searchValue.trim()}>
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </Button>
            </div>

            {/* ─── Résultat ─── */}
            {sale && (
              <>
                {/* Infos vente */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{sale.sale_number}</p>
                      <p className="text-sm text-gray-500">
                        {sale.client_name || 'Client anonyme'} · {new Date(sale.sale_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-bold">
                      {Number(sale.total_amount).toLocaleString()} FCFA
                    </Badge>
                  </div>
                  {Number(sale.returned_amount) > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                      <AlertCircle size={12} />
                      Retours précédents : {Number(sale.returned_amount).toLocaleString()} FCFA
                    </div>
                  )}
                </div>

                {/* Articles */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Sélectionner les articles à retourner :</p>
                  {(sale.items || []).map(item => {
                    const sel = selectedItems[item.id] || { qty: 0, return_type: 'reintegrable', reason: 'defective', maxQty: item.quantity };
                    const maxQty = sel.maxQty;
                    return (
                      <div key={item.id} className={`border rounded-xl p-3 transition-colors ${sel.qty > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Package size={16} className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{item.product_name}</p>
                              <p className="text-xs text-gray-500">{Number(item.unit_price).toLocaleString()} FCFA × {item.quantity} · Max retournable: {maxQty}</p>
                            </div>
                          </div>
                          {/* Quantité */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => updateItem(item.id, 'qty', Math.max(0, sel.qty - 1))}
                              className="w-7 h-7 rounded-lg border flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                            >−</button>
                            <span className="w-8 text-center font-bold text-sm">{sel.qty}</span>
                            <button
                              onClick={() => updateItem(item.id, 'qty', Math.min(maxQty, sel.qty + 1))}
                              className="w-7 h-7 rounded-lg border flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                            >+</button>
                          </div>
                        </div>
                        {sel.qty > 0 && (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <Select value={sel.return_type} onValueChange={v => updateItem(item.id, 'return_type', v)}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Type de retour" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reintegrable">Réintégrable (stock)</SelectItem>
                                <SelectItem value="defective">Défectueux (perte)</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={sel.reason} onValueChange={v => updateItem(item.id, 'reason', v)}>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Raison" />
                              </SelectTrigger>
                              <SelectContent>
                                {RETURN_REASONS.map(r => (
                                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Notes */}
                <Input
                  placeholder="Notes (optionnel)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />

                {/* Total + Valider */}
                {itemsToReturn.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700">Remboursement total</p>
                      <p className="text-xl font-bold text-orange-600">{totalRefund.toLocaleString()} FCFA</p>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <RotateCcw size={16} className="mr-2" />}
                      Confirmer le retour
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}