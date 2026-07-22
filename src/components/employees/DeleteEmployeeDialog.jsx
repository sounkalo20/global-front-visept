import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { deleteEmployee } from '@/lib/api/employees';
import { toast } from 'sonner';

export default function DeleteEmployeeDialog({ employee, open, onOpenChange, companyId, onEmployeeDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!employee) return;
    
    setIsDeleting(true);
    try {
      await deleteEmployee(employee.id, companyId);
      toast.success('Employé retiré avec succès');
      onEmployeeDeleted();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retirer cet employé ?</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir retirer <strong>{employee?.first_name} {employee?.last_name}</strong> de cette boutique ?
            L'utilisateur n'aura plus accès à cet espace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Retirer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
