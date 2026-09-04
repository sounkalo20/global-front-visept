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

export default function RestaurantRolesPage() {
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
        router.push('/restaurant/dashboard');
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
            <h1 className="text-2xl font-bold text-gray-900">Rôles et Permissions Restaurant</h1>
            <p className="text-gray-500 mt-1">
              Gérez les niveaux d'accès de votre équipe (Serveurs, Caissiers, Cuisiniers, Gérants).
            </p>
          </div>
          <HasPermission required="roles.manage">
            <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
              <Plus size={18} className="mr-2" />
              Créer un rôle
            </Button>
          </HasPermission>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Rechercher un rôle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des Rôles */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Aucun rôle trouvé</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? 'Aucun résultat pour votre recherche' : 'Commencez par créer votre premier rôle personnalisé'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {role.is_system === 1 && (
                  <span className="absolute top-0 right-0 bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-100 uppercase tracking-wider">
                    Système
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                      <Shield size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{role.name}</h3>
                      <span className="text-xs text-gray-500">
                        {role.users_count || 0} employé(s) affecté(s)
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {role.description || 'Aucune description fournie.'}
                  </p>

                  <div className="space-y-1 mb-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      Permissions ({role.permissions?.length || 0}) :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(role.permissions || []).slice(0, 4).map((p, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                          {p}
                        </span>
                      ))}
                      {(role.permissions || []).length > 4 && (
                        <span className="bg-gray-100 text-gray-500 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          +{(role.permissions || []).length - 4} autres
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-2">
                  <HasPermission required="roles.manage">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(role)}
                      className="flex-1 text-xs"
                      disabled={role.name === 'Propriétaire'}
                    >
                      <Edit2 size={14} className="mr-1.5" />
                      {role.is_system ? 'Voir / Ajuster' : 'Modifier'}
                    </Button>
                    {!role.is_system && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRoleToDelete(role)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </HasPermission>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Création / Édition Rôle */}
        {isModalOpen && (
          <RoleModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setRoleToEdit(null);
            }}
            role={roleToEdit}
            companyId={activeCompany.id}
            onSuccess={() => {
              setIsModalOpen(false);
              setRoleToEdit(null);
              fetchRolesList();
            }}
          />
        )}

        {/* Modal Confirmation Suppression */}
        {roleToDelete && (
          <ConfirmModal
            isOpen={!!roleToDelete}
            onClose={() => setRoleToDelete(null)}
            onConfirm={handleDeleteConfirm}
            title="Supprimer le rôle"
            description={`Êtes-vous sûr de vouloir supprimer le rôle "${roleToDelete.name}" ? Les employés rattachés devront être réassignés.`}
            isLoading={isDeleting}
          />
        )}
      </div>
    </FeatureLockedOverlay>
  );
}
