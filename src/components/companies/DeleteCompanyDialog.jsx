'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { companiesApi } from '@/lib/api/companies';
import useCompanyStore from '@/store/companyStore';

export default function DeleteCompanyDialog({ company, open, onOpenChange }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteCompany } = useCompanyStore();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await companiesApi.delete(company.id);
      deleteCompany(company.id);
      toast.success('Entreprise supprimée avec succès.');
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l'entreprise</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer <strong>{company?.name}</strong> ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Annuler
          </Button>
          <Button variant="default" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Trash2 size={16} className="mr-2" />
            )}
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}