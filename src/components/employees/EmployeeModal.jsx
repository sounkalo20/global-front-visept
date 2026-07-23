import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { createEmployee, updateEmployee } from '@/lib/api/employees';
import { toast } from 'sonner';

const employeeSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  role: z.enum(['manager', 'cashier'], { required_error: 'Le rôle est requis' }),
  password: z.string().optional(),
});

export default function EmployeeModal({ isOpen, onClose, employeeToEdit, companyId, onEmployeeSaved }) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'manager',
      password: '',
    }
  });

  useEffect(() => {
    if (employeeToEdit) {
      reset({
        first_name: employeeToEdit.first_name || '',
        last_name: employeeToEdit.last_name || '',
        email: employeeToEdit.email || '',
        phone: employeeToEdit.phone || '',
        role: employeeToEdit.role || 'manager',
        password: '',
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'manager',
        password: '',
      });
    }
  }, [employeeToEdit, reset, isOpen]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (employeeToEdit) {
        // Mode édition
        await updateEmployee(employeeToEdit.id, {
          ...data,
          company_id: companyId,
        });
        toast.success('Employé mis à jour');
      } else {
        // Mode création
        if (!data.password) {
            toast.error('Le mot de passe est requis pour un nouvel employé');
            setIsLoading(false);
            return;
        }
        await createEmployee({
          ...data,
          company_id: companyId,
        });
        toast.success('Employé ajouté');
      }
      onEmployeeSaved();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {employeeToEdit ? 'Modifier l\'employé' : 'Ajouter un employé'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input id="first_name" {...register('first_name')} disabled={isLoading} />
              {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input id="last_name" {...register('last_name')} disabled={isLoading} />
              {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} disabled={!!employeeToEdit || isLoading} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            {!!employeeToEdit && <p className="text-xs text-gray-500">L'email ne peut pas être modifié.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" type="tel" {...register('phone')} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select 
              value={register('role').value} 
              onValueChange={(val) => register('role').onChange({ target: { value: val, name: 'role' }})} 
              defaultValue="manager"
              {...register('role')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Gérant</SelectItem>
                <SelectItem value="cashier">Caissier</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe {employeeToEdit ? '(Laisser vide pour ne pas modifier)' : '*'}</Label>
            <Input id="password" type="password" {...register('password')} disabled={isLoading} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {employeeToEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
