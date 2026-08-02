import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createRole, updateRole, getSystemPermissions } from '@/lib/api/rbac';
import { toast } from 'sonner';

const roleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export default function RoleModal({ isOpen, onClose, roleToEdit, companyId, onRoleSaved }) {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionsGrouped, setPermissionsGrouped] = useState({});
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    }
  });

  const selectedPerms = watch('permissions');

  useEffect(() => {
    const fetchPerms = async () => {
      setIsLoadingPerms(true);
      try {
        const res = await getSystemPermissions();
        setPermissionsGrouped(res.data.grouped_permissions);
      } catch (error) {
        toast.error('Erreur lors du chargement des permissions système');
      } finally {
        setIsLoadingPerms(false);
      }
    };
    if (isOpen) {
      fetchPerms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (roleToEdit) {
      reset({
        name: roleToEdit.name || '',
        description: roleToEdit.description || '',
        permissions: roleToEdit.permissions || [],
      });
    } else {
      reset({
        name: '',
        description: '',
        permissions: [],
      });
    }
  }, [roleToEdit, reset, isOpen]);

  const handleTogglePermission = (code) => {
    const current = [...selectedPerms];
    const index = current.indexOf(code);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(code);
    }
    setValue('permissions', current, { shouldDirty: true });
  };

  const handleToggleModule = (moduleName, permsInModule) => {
    const moduleCodes = permsInModule.map(p => p.code);
    const allSelected = moduleCodes.every(c => selectedPerms.includes(c));
    
    let newSelected = [...selectedPerms];
    if (allSelected) {
      // Désélectionner tout le module
      newSelected = newSelected.filter(c => !moduleCodes.includes(c));
    } else {
      // Sélectionner tout le module
      moduleCodes.forEach(c => {
        if (!newSelected.includes(c)) newSelected.push(c);
      });
    }
    setValue('permissions', newSelected, { shouldDirty: true });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (roleToEdit) {
        await updateRole(companyId, roleToEdit.id, data);
        toast.success('Rôle mis à jour');
      } else {
        await createRole(companyId, data);
        toast.success('Rôle créé avec succès');
      }
      onRoleSaved();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {roleToEdit ? 'Modifier le rôle' : 'Créer un rôle'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden mt-4">
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du rôle *</Label>
                <Input id="name" {...register('name')} disabled={isLoading || (roleToEdit?.is_system)} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                {roleToEdit?.is_system && <p className="text-xs text-gray-500">Le nom d'un rôle système ne peut être modifié.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register('description')} disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              {isLoadingPerms ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-brand-600" size={24} />
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permissionsGrouped).map(([moduleName, perms]) => {
                    const moduleCodes = perms.map(p => p.code);
                    const allSelected = moduleCodes.every(c => selectedPerms.includes(c));
                    const someSelected = moduleCodes.some(c => selectedPerms.includes(c));
                    
                    return (
                      <div key={moduleName} className="border rounded-lg overflow-hidden bg-white">
                        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">{moduleName}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                            onClick={() => handleToggleModule(moduleName, perms)}
                          >
                            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                          </Button>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {perms.map(p => (
                            <label key={p.code} className="flex items-start gap-3 cursor-pointer group">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
                                  checked={selectedPerms.includes(p.code)}
                                  onChange={() => handleTogglePermission(p.code)}
                                  disabled={isLoading || (roleToEdit?.is_system && roleToEdit?.name === 'Propriétaire')}
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{p.name}</span>
                                <span className="text-xs text-gray-500">{p.description}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          <div className="pt-4 border-t flex justify-end gap-2 mt-auto">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {roleToEdit ? 'Enregistrer' : 'Créer le rôle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
