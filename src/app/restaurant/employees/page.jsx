'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, Mail, Phone, User as UserIcon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useCompanyStore from '@/store/companyStore';
import { getEmployees, bulkEmployeeAction } from '@/lib/api/employees';
import { getRoles } from '@/lib/api/rbac';
import EmployeeModal from '@/components/employees/EmployeeModal';
import DeleteEmployeeDialog from '@/components/employees/DeleteEmployeeDialog';
import { toast } from 'sonner';
import { FeatureLockedOverlay } from '@/components/ui/FeatureLockedOverlay';
import { useSubscription } from '@/hooks/useSubscription';
import HasPermission from '@/components/auth/HasPermission';

export default function RestaurantEmployeesPage() {
  const { activeCompany } = useCompanyStore();
  const { hasFeature } = useSubscription();
  const searchParams = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(() => searchParams?.get('search') || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const fetchEmployeesList = useCallback(async () => {
    if (!activeCompany?.id) return;
    if (!hasFeature('module_employees')) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [data, rolesData] = await Promise.all([
        getEmployees(activeCompany.id),
        getRoles(activeCompany.id).catch(() => ({ data: { roles: [] } })),
      ]);
      setEmployees(data.data.employees || []);
      setRoles(rolesData.data?.roles || rolesData.data || []);
    } catch (error) {
      if (error.response?.status !== 403) {
        toast.error('Erreur lors du chargement des employés');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeCompany?.id, hasFeature]);

  useEffect(() => {
    fetchEmployeesList();
  }, [fetchEmployeesList]);

  const handleOpenModal = (employee = null) => {
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return employees.filter((emp) => {
      const name = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const roleName = (emp.role_name || '').toLowerCase();
      return name.includes(query) || email.includes(query) || roleName.includes(query);
    });
  }, [employees, searchQuery]);

  if (!activeCompany) return null;

  return (
    <FeatureLockedOverlay
      featureName="module_employees"
      title="Module Bloqué"
      description="Le module de gestion des employés n'est pas inclus dans votre forfait actuel."
    >
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Personnel & Employés Restaurant</h1>
            <p className="text-gray-500 mt-1">
              Gérez vos serveurs, cuisiniers, barmans, caissiers et gérants d'établissement.
            </p>
          </div>
          <HasPermission required="employees.create">
            <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
              <Plus size={18} className="mr-2" />
              Ajouter un employé
            </Button>
          </HasPermission>
        </div>

        {/* Barre de Recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Rechercher par nom, email, rôle (ex: Serveur)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tableau / Cartes des Employés */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Aucun employé trouvé</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? 'Aucun résultat ne correspond à votre recherche' : 'Commencez par ajouter les membres de votre équipe restaurant'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((emp) => {
              const isOwner = emp.role_name === 'Propriétaire';

              return (
                <div
                  key={emp.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {isOwner && (
                    <span className="absolute top-0 right-0 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-100 uppercase tracking-wider">
                      Propriétaire
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-500/20">
                        {(emp.first_name ? emp.first_name[0] : 'E').toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">
                          {emp.first_name} {emp.last_name || ''}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 mt-0.5">
                          <ShieldCheck size={12} className="text-amber-500" />
                          {emp.role_name || 'Membre'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                      {emp.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span className="truncate">{emp.email}</span>
                        </div>
                      )}
                      {emp.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-4">
                    <HasPermission required="employees.edit">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(emp)}
                        className="flex-1 text-xs"
                        disabled={isOwner}
                      >
                        <Edit2 size={14} className="mr-1.5" /> Modifier
                      </Button>
                    </HasPermission>

                    {!isOwner && (
                      <HasPermission required="employees.delete">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEmployeeToDelete(emp)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </HasPermission>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Création / Édition Employé */}
        {isModalOpen && (
          <EmployeeModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEmployeeToEdit(null);
            }}
            employee={employeeToEdit}
            roles={roles}
            companyId={activeCompany.id}
            onSuccess={() => {
              setIsModalOpen(false);
              setEmployeeToEdit(null);
              fetchEmployeesList();
            }}
          />
        )}

        {/* Dialog Suppression Employé */}
        {employeeToDelete && (
          <DeleteEmployeeDialog
            isOpen={!!employeeToDelete}
            onClose={() => setEmployeeToDelete(null)}
            employee={employeeToDelete}
            companyId={activeCompany.id}
            onSuccess={() => {
              setEmployeeToDelete(null);
              fetchEmployeesList();
            }}
          />
        )}
      </div>
    </FeatureLockedOverlay>
  );
}
