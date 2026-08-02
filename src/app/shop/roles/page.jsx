'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Shield, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useCompanyStore from '@/store/companyStore';
import { getRoles, deleteRole } from '@/lib/api/rbac';
import RoleModal from '@/components/roles/RoleModal';
import { toast } from 'sonner';
import ConfirmModal from '@/components/inventory/ConfirmModal';
import { FeatureLockedOverlay } from '@/components/ui/FeatureLockedOverlay';
import { useSubscription } from '@/hooks/useSubscription';
import HasPermission from '@/components/auth/HasPermission';
import { useRouter } from 'next/navigation';

export default function RolesPage() {
  const { activeCompany } = useCompanyStore();
  const { hasFeature } = useSubscription();
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRolesList = useCallback(async () => {
    if (!activeCompany?.id) return;
    if (!hasFeature('module_employees')) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getRoles(activeCompany.id);
      setRoles(data.data.roles);
    } catch (error) {
      if (error.response?.status !== 403) {
        toast.error('Erreur lors du chargement des rôles');
      } else {
        router.push('/shop/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeCompany?.id, hasFeature, router]);

  useEffect(() => {
    fetchRolesList();
  }, [fetchRolesList]);

  const handleOpenModal = (role = null) => {
    setRoleToEdit(role);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRole(activeCompany.id, roleToDelete.id);
      toast.success('Rôle supprimé avec succès');
      setRoleToDelete(null);
      fetchRolesList();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRoles = roles.filter((r) => {
    const term = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(term);
  });

  if (!activeCompany) return null;

  return (
    <FeatureLockedOverlay 
      featureName="module_employees"
      title="Module Bloqué"
      description="Le module de gestion des rôles n'est pas inclus dans votre forfait actuel."
    >
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rôles et Permissions</h1>
          <p className="text-gray-500 mt-1">
            Gérez les niveaux d'accès de vos employés.
          </p>
        </div>
        <HasPermission required="roles.manage">
          <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
            <Plus size={18} className="mr-2" />
            Créer un rôle
          </Button>
        </HasPermission>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Rechercher un rôle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm">
          <Shield className="mx-auto mb-3 text-gray-400" size={32} />
          <h3 className="text-lg font-medium text-gray-900">Aucun rôle trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer un nouveau rôle personnalisé.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div key={role.id} className="rounded-xl border bg-white shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden">
              {role.is_system ? (
                <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Système
                </div>
              ) : null}
              
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.users_count || 0} employé(s)</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 line-clamp-2 min-h-[40px]">
                {role.description || "Aucune description"}
              </p>

              <HasPermission required="roles.manage">
                <div className="flex justify-end gap-2 border-t pt-4">
                  {!role.is_system || role.name !== 'Propriétaire' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(role)}
                      className="text-gray-700"
                    >
                      <Edit2 size={14} className="mr-2" /> Modifier
                    </Button>
                  ) : null}

                  {!role.is_system && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRoleToDelete(role)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </HasPermission>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <RoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          roleToEdit={roleToEdit}
          companyId={activeCompany?.id}
          onRoleSaved={fetchRolesList}
        />
      )}

      <ConfirmModal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le rôle"
        description={`Êtes-vous sûr de vouloir supprimer le rôle "${roleToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
    </FeatureLockedOverlay>
  );
}
