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
  role_id: z.string().min(1, 'Le rôle est requis'),
  password: z.string().optional(),
});

export default function EmployeeModal({ isOpen, onClose, employeeToEdit, companyId, onEmployeeSaved }) {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const { getRoles } = require('@/lib/api/rbac');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role_id: '',
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
        role_id: employeeToEdit.role_id?.toString() || '',
        password: '',
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role_id: '',
        password: '',
      });
    }
  }, [employeeToEdit, reset, isOpen]);

  useEffect(() => {
    const fetchRoles = async () => {
      if (companyId && isOpen) {
        setIsLoadingRoles(true);
        try {
          const res = await getRoles(companyId);
          // On ne permet pas d'assigner le rôle Propriétaire
          const assignableRoles = res.data.roles.filter(r => r.name !== 'Propriétaire');
          setRoles(assignableRoles);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingRoles(false);
        }
      }
    };
    fetchRoles();
  }, [companyId, isOpen]);

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
              <Label htmlFor="first_name" className="text-gray-700 dark:text-[#D1D5DB] font-semibold">Prénom</Label>
              <Input id="first_name" {...register('first_name')} disabled={isLoading} />
              {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-gray-700 dark:text-[#D1D5DB] font-semibold">Nom</Label>
              <Input id="last_name" {...register('last_name')} disabled={isLoading} />
              {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-[#D1D5DB] font-semibold">Email</Label>
            <Input id="email" type="email" {...register('email')} disabled={!!employeeToEdit || isLoading} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            {!!employeeToEdit && <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">L'email ne peut pas être modifié.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 dark:text-[#D1D5DB] font-semibold">Téléphone</Label>
            <Input id="phone" type="tel" {...register('phone')} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_id" className="text-gray-700 dark:text-[#D1D5DB] font-semibold">Rôle</Label>
            <Select 
              value={register('role_id').value} 
              onValueChange={(val) => register('role_id').onChange({ target: { value: val, name: 'role_id' }})} 
              {...register('role_id')}
              disabled={isLoading || isLoadingRoles}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingRoles ? "Chargement des rôles..." : "Sélectionnez un rôle"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role_id && <p className="text-xs text-red-500">{errors.role_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 dark:text-[#D1D5DB] font-semibold">Mot de passe {employeeToEdit ? '(Laisser vide pour ne pas modifier)' : '*'}</Label>
            <Input id="password" type="password" {...register('password')} disabled={isLoading} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-[#374151] flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {employeeToEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
