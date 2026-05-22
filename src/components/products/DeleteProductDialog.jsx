'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useProductStore from '@/store/productStore';
import useCompanyStore from '@/store/companyStore';

export default function DeleteProductDialog({ product, open, onOpenChange, onSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteProduct } = useProductStore();
  const { activeCompany } = useCompanyStore();

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    const result = await deleteProduct(product.id, activeCompany.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success('Produit supprimé.');
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <DialogTitle>Supprimer le produit</DialogTitle>
          </div>
          <DialogDescription>
            Voulez-vous vraiment supprimer <strong>{product?.name}</strong> ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Annuler</Button>
          <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
            {isDeleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}