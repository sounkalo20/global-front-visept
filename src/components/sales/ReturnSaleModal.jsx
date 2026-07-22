'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Package, Plus, Minus, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { returnService } from '@/lib/api/returns';
import { toast } from 'sonner';
import useCompanyStore from '@/store/companyStore';

export default function ReturnSaleModal({ sale, open, onOpenChange, onSuccess }) {
  const { activeCompany } = useCompanyStore();
  const [itemsToReturn, setItemsToReturn] = useState([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && sale) {
      // Initialize with no items returning
      setItemsToReturn(
        sale.items.map(item => ({
          ...item,
          returningQty: 0,
          returnType: 'reintegrable',
          reason: ''
        }))
      );
      setNotes('');
    }
  }, [open, sale]);

  if (!sale) return null;

  const updateItem = (id, field, value) => {
    setItemsToReturn(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const hasItemsToReturn = itemsToReturn.some(i => i.returningQty > 0);

  const totalAmountToReturn = itemsToReturn.reduce((sum, item) => {
    return sum + (item.returningQty * parseInt(item.unit_price));
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasItemsToReturn) {
      toast.error('Veuillez sélectionner au moins un article à retourner.');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        company_id: activeCompany?.id || sale.company_id,
        sale_id: sale.id,
        notes: notes,
        items: itemsToReturn
          .filter(i => i.returningQty > 0)
          .map(i => ({
            sale_item_id: i.id,
            quantity: i.returningQty,
            return_type: i.returnType,
            reason: i.reason
          }))
      };

      await returnService.createReturn(payload);
      toast.success('Retour enregistré avec succès !');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement du retour.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl md:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 md:px-8 py-5 md:py-6 border-b">
          <DialogTitle className="text-lg md:text-xl">Retour Produit - Vente {sale.sale_number}</DialogTitle>
          <DialogDescription className="text-sm md:text-base mt-1.5">
            Sélectionnez les articles à retourner et précisez s'ils sont réintégrables au stock.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-5 md:py-6">
          <form id="return-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-5">
              {itemsToReturn.map(item => (
                <div key={item.id} className="p-5 md:p-6 border rounded-xl bg-white shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package size={22} className="text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base">{item.product_name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {parseInt(item.unit_price).toLocaleString()} F/u • Qté vendue: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 self-start ml-auto sm:ml-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 md:h-10 md:w-10"
                        disabled={item.returningQty <= 0}
                        onClick={() => updateItem(item.id, 'returningQty', item.returningQty - 1)}
                      >
                        <Minus size={16} />
                      </Button>
                      <div className="w-16 text-center font-medium text-lg">
                        {item.returningQty}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 md:h-10 md:w-10"
                        disabled={item.returningQty >= item.quantity}
                        onClick={() => updateItem(item.id, 'returningQty', item.returningQty + 1)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  {item.returningQty > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Type de retour</Label>
                        <Select
                          value={item.returnType}
                          onValueChange={(val) => updateItem(item.id, 'returnType', val)}
                        >
                          <SelectTrigger className="h-10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reintegrable">Réintégrable (Retour au stock)</SelectItem>
                            <SelectItem value="defective">Défectueux (Perte)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Motif (optionnel)</Label>
                        <Input
                          className="h-10 text-sm"
                          placeholder="Ex: Mauvaise taille..."
                          value={item.reason}
                          onChange={(e) => updateItem(item.id, 'reason', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes supplémentaires (Globales)</Label>
              <Textarea
                placeholder="Informations supplémentaires sur le retour..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none min-h-[80px]"
                rows={3}
              />
            </div>

            {hasItemsToReturn && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm md:text-base text-blue-800">
                  L'historique de la vente originale restera intact. Le montant de <strong>{totalAmountToReturn.toLocaleString()} F</strong> sera déduit du CA Net dans vos statistiques.
                </p>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="px-6 md:px-8 py-4 md:py-5 border-t bg-gray-50 shrink-0 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-11 px-6"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="return-form"
            disabled={!hasItemsToReturn || isLoading}
          >
            {isLoading ? 'Enregistrement...' : `Confirmer le retour (${totalAmountToReturn.toLocaleString()} F)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}