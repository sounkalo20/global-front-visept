'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, Archive, Store, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import useProductStore from '@/store/productStore';
import useCompanyStore from '@/store/companyStore';
import useWarehouseStore from '@/store/warehouseStore';

export default function DeleteProductDialog({ product, open, onOpenChange, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [option, setOption] = useState('B');
  const [targetWarehouseId, setTargetWarehouseId] = useState('');
  
  const { deleteProduct } = useProductStore();
  const { activeCompany } = useCompanyStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();

  useEffect(() => {
    if (open) {
      fetchWarehouses();
      // Reset state
      setOption('B');
      setTargetWarehouseId('');
    }
  }, [open, fetchWarehouses]);

  const hasStock = product && parseFloat(product.current_stock) > 0;

  const handleDelete = async () => {
    if (!product) return;
    
    if (option === 'A' && !targetWarehouseId) {
      toast.error('Veuillez sélectionner un entrepôt cible.');
      return;
    }
    
    if (option === 'C') {
      const confirmGlobal = window.confirm("ATTENTION: Vous êtes sur le point de retirer ce produit de tous vos entrepôts. Cette action modifiera les stocks globaux. Continuer ?");
      if (!confirmGlobal) return;
    }

    setIsDeleting(true);
    const result = await deleteProduct(product.id, activeCompany.id, {
      option,
      targetWarehouseId: option === 'A' ? targetWarehouseId : null
    });
    
    setIsDeleting(false);
    
    if (result.success) {
      toast.success('Produit désactivé avec succès.');
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <DialogTitle>Désactiver le produit : {product?.name}</DialogTitle>
          </div>
          <DialogDescription>
            Ce produit ne sera pas supprimé physiquement pour conserver l'historique de vos ventes, mais il sera <strong>désactivé</strong>. Que souhaitez-vous faire des stocks actuels ?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={option} onValueChange={setOption} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* OPTION A */}
            <div className={`relative flex flex-col gap-3 p-4 border rounded-lg transition-colors h-full ${option === 'A' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'} ${!hasStock ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="A" id="option-a" className="mt-1" disabled={!hasStock} />
                <div className="flex-1">
                  <Label htmlFor="option-a" className="font-semibold text-base cursor-pointer">
                    Option A — Retirer de la boutique et récupérer le stock
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Désactive le produit en boutique et transfère le stock restant ({product?.current_stock} unités) vers un entrepôt.
                  </p>
                  {!hasStock && (
                    <span className="inline-block mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Indisponible : aucun stock en boutique
                    </span>
                  )}
                </div>
                <Archive className="text-muted-foreground absolute top-4 right-4 opacity-20" size={32} />
              </div>
              
              {option === 'A' && hasStock && (
                <div className="ml-8 mt-2">
                  <Label className="mb-2 block">Dans quel entrepôt récupérer ces produits ?</Label>
                  <Select value={targetWarehouseId} onValueChange={setTargetWarehouseId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez un entrepôt..." />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* OPTION B */}
            <div className={`relative flex flex-col gap-3 p-4 border rounded-lg transition-colors h-full ${option === 'B' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="B" id="option-b" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="option-b" className="font-semibold text-base cursor-pointer">
                      Option B — Désactiver uniquement dans la boutique
                    </Label>
                    <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      Recommandé
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Le produit devient inactif pour cette boutique. Les stocks présents dans vos entrepôts globaux ne sont pas modifiés.
                  </p>
                </div>
                <Store className="text-muted-foreground absolute top-4 right-4 opacity-20" size={32} />
              </div>
            </div>

            {/* OPTION C */}
            <div className={`relative flex flex-col gap-3 p-4 border rounded-lg transition-colors border-red-200 h-full ${option === 'C' ? 'border-red-500 bg-red-50' : 'hover:border-red-300'}`}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="C" id="option-c" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="option-c" className="font-semibold text-base cursor-pointer text-red-700">
                      Option C — Désactiver partout
                    </Label>
                    <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                      Affecte les entrepôts
                    </span>
                  </div>
                  <p className="text-sm text-red-600/80 mt-1">
                    Désactive le produit en boutique et <strong>met à zéro tous ses stocks dans tous les entrepôts</strong>. Un mouvement d'ajustement "Suppression" sera créé.
                  </p>
                </div>
                <Trash2 className="text-red-500/30 absolute top-4 right-4 opacity-20" size={32} />
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="gap-3 sm:gap-0 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Annuler
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={isDeleting || (option === 'A' && !targetWarehouseId)} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Confirmer la désactivation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}