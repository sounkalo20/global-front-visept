'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Mail, Phone, User as UserIcon, CheckCircle2, Ban, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useCompanyStore from '@/store/companyStore';
import { getEmployees, bulkEmployeeAction } from '@/lib/api/employees';
import { getRoles } from '@/lib/api/rbac';
import EmployeeModal from '@/components/employees/EmployeeModal';
import DeleteEmployeeDialog from '@/components/employees/DeleteEmployeeDialog';
import BulkActionBar from '@/components/common/BulkActionBar';
import BulkConfirmModal from '@/components/common/BulkConfirmModal';
import BulkResultModal from '@/components/common/BulkResultModal';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { toast } from 'sonner';
import { FeatureLockedOverlay } from '@/components/ui/FeatureLockedOverlay';
import { useSubscription } from '@/hooks/useSubscription';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';
import { cn } from '@/lib/utils';

export default function EmployeesPage() {
  const { activeCompany } = useCompanyStore();
  const { hasFeature } = useSubscription();
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Modals pour les Bulk Actions
  const [bulkConfirm, setBulkConfirm] = useState({
    open: false,
    action: null,
    title: '',
    description: '',
    isDestructive: false,
    actionType: 'default',
    warningMessage: null,
    options: [],
    optionsLabel: '',
    confirmLabel: 'Confirmer',
  });
  const [isBulkExecuting, setIsBulkExecuting] = useState(false);
  const [bulkResult, setBulkResult] = useState({ open: false, result: null });

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
    return employees.filter((emp) => {
      const term = searchQuery.toLowerCase();
      return (
        (emp.first_name || '').toLowerCase().includes(term) ||
        (emp.last_name || '').toLowerCase().includes(term) ||
        (emp.email || '').toLowerCase().includes(term) ||
        (emp.role_name || '').toLowerCase().includes(term)
      );
    });
  }, [employees, searchQuery]);

  // Hook de sélection en masse
  const bulkSelection = useBulkSelection(filteredEmployees);

  // Exécution de l'action en masse
  const handleExecuteBulkAction = async ({ value } = {}) => {
    if (!activeCompany || bulkSelection.selectedCount === 0) return;

    setIsBulkExecuting(true);
    const action = bulkConfirm.action;
    const params = {};

    if (action === 'change_role') {
      params.role_id = parseInt(value);
    }

    try {
      const response = await bulkEmployeeAction(activeCompany.id, {
        ids: bulkSelection.selectedIdsArray,
        action,
        params,
      });

      setIsBulkExecuting(false);
      setBulkConfirm((prev) => ({ ...prev, open: false }));

      bulkSelection.clearSelection();
      fetchEmployeesList();

      if (response.data?.skipped_count > 0 || response.data?.failed_count > 0) {
        setBulkResult({ open: true, result: response.data });
      } else {
        toast.success(response.message || `${bulkSelection.selectedCount} employé(s) traité(s).`);
      }
    } catch (error) {
      setIsBulkExecuting(false);
      toast.error(error.response?.data?.message || "Erreur lors de l'action en masse.");
    }
  };

  const roleOptions = useMemo(() => {
    return (roles || [])
      .filter((r) => r.name !== 'Propriétaire')
      .map((r) => ({
        value: r.id,
        label: r.name,
      }));
  }, [roles]);

  const bulkPrimaryActions = [
    {
      label: 'Activer accès',
      icon: CheckCircle2,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'activate',
          actionType: 'default',
          title: 'Activer les accès sélectionnés',
          description: 'Rétablit l\'accès à l\'application pour tous les employés sélectionnés.',
          isDestructive: false,
          confirmLabel: 'Activer les accès',
        });
      },
    },
    {
      label: 'Désactiver accès',
      icon: Ban,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'deactivate',
          actionType: 'default',
          title: 'Désactiver les accès sélectionnés',
          description: 'Suspend temporairement la connexion à la boutique pour ces employés.',
          isDestructive: false,
          confirmLabel: 'Désactiver les accès',
          warningMessage: 'Votre propre compte et le compte Propriétaire seront automatiquement protégés.',
        });
      },
    },
    {
      label: 'Changer de rôle',
      icon: ShieldCheck,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'change_role',
          actionType: 'change_role',
          title: 'Attribuer un nouveau rôle',
          description: 'Affecte un rôle et des permissions identiques aux employés sélectionnés.',
          options: roleOptions,
          optionsLabel: 'Nouveau rôle à assigner',
          isDestructive: false,
          confirmLabel: 'Modifier le rôle',
        });
      },
    },
  ];

  const bulkSecondaryActions = [
    {
      label: 'Retirer de la boutique',
      icon: Trash2,
      danger: true,
      onClick: () => {
        setBulkConfirm({
          open: true,
          action: 'delete',
          actionType: 'delete',
          title: 'Retirer les employés de la boutique',
          description: 'Supprime définitivement l\'adhésion et les droits d\'accès de ces employés.',
          isDestructive: true,
          confirmLabel: 'Retirer définitivement',
          warningMessage: 'Votre propre compte et le compte Propriétaire ne seront pas affectés.',
        });
      },
    },
  ];

  if (!activeCompany) return null;

  return (
    <FeatureLockedOverlay 
      featureName="module_employees"
      title="Module Employés bloqué"
      description="Le module de gestion des employés et des accès n'est pas inclus dans votre forfait actuel."
    >
      <PermissionGuard requiredPermission="employees.view">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F9FAFB]">Employés</h1>
                <p className="text-gray-500 dark:text-[#D1D5DB] mt-1">
                  Gérez les accès et les membres de votre boutique ({filteredEmployees.length}).
                </p>
              </div>
              <HasPermission required="employees.create">
                <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white">
                  <Plus size={18} className="mr-2" />
                  Ajouter un employé
                </Button>
              </HasPermission>
            </div>

            {/* Search */}
            <div className="mb-6 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#9CA3AF]" size={18} />
              <Input
                type="text"
                placeholder="Rechercher par nom, email ou rôle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-[#111827] dark:border-[#374151] dark:text-[#F9FAFB]"
              />
            </div>

            {/* Table / List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-[#374151] bg-white dark:bg-[#111827] py-12 text-center shadow-xs">
                <UserIcon className="mx-auto mb-3 text-gray-400 dark:text-[#9CA3AF]" size={32} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F9FAFB]">Aucun employé trouvé</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#D1D5DB]">
                  {searchQuery ? 'Essayez une autre recherche' : 'Commencez par ajouter un employé à votre boutique'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => handleOpenModal()} variant="outline" className="mt-4 dark:border-[#374151] dark:text-[#F9FAFB]">
                    <Plus size={18} className="mr-2" />
                    Ajouter
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/80 dark:bg-[#1F2937]/80 text-gray-500 dark:text-[#D1D5DB] border-b border-gray-200 dark:border-[#374151]">
                      <tr>
                        <th className="px-4 py-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={bulkSelection.isAllPageSelected}
                            ref={(input) => {
                              if (input) input.indeterminate = bulkSelection.isSomePageSelected;
                            }}
                            onChange={bulkSelection.toggleSelectPage}
                            aria-label="Sélectionner tous les employés"
                            className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                          />
                        </th>
                        <th className="px-6 py-4 font-semibold uppercase text-xs">Nom & Prénom</th>
                        <th className="px-6 py-4 font-semibold uppercase text-xs">Contact</th>
                        <th className="px-6 py-4 font-semibold uppercase text-xs">Rôle</th>
                        <th className="px-6 py-4 font-semibold uppercase text-xs">Date d'ajout</th>
                        <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
                      {filteredEmployees.map((emp) => {
                        const selected = bulkSelection.isSelected(emp.id);
                        return (
                          <tr
                            key={emp.id}
                            className={cn(
                              "transition-colors",
                              selected
                                ? "bg-brand-50/70 dark:bg-brand-950/40"
                                : "hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/40"
                            )}
                          >
                            <td className="px-4 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => bulkSelection.toggleSelect(emp.id)}
                                aria-label={`Sélectionner ${emp.first_name} ${emp.last_name}`}
                                className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold">
                                  {emp.first_name?.[0] || '?'}{emp.last_name?.[0] || ''}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-[#F9FAFB]">{emp.first_name} {emp.last_name}</p>
                                  {!emp.is_active && (
                                    <span className="inline-block px-2 py-0.5 mt-1 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 rounded-full">
                                      Inactif
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 space-y-1">
                              <div className="flex items-center text-gray-600 dark:text-[#D1D5DB]">
                                <Mail size={14} className="mr-2 text-gray-400 dark:text-[#9CA3AF]" />
                                {emp.email}
                              </div>
                              {emp.phone && (
                                <div className="flex items-center text-gray-600 dark:text-[#D1D5DB]">
                                  <Phone size={14} className="mr-2 text-gray-400 dark:text-[#9CA3AF]" />
                                  {emp.phone}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-500/20">
                                {emp.role_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-[#9CA3AF]">
                              {new Date(emp.joined_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <HasPermission required="employees.edit">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenModal(emp)}
                                    className="text-gray-500 dark:text-[#D1D5DB] hover:text-brand-600 hover:bg-gray-100 dark:hover:bg-[#1F2937]"
                                    title="Modifier"
                                  >
                                    <Edit2 size={16} />
                                  </Button>
                                </HasPermission>
                                <HasPermission required="employees.delete">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEmployeeToDelete(emp)}
                                    className="text-gray-500 dark:text-[#D1D5DB] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    title="Retirer"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </HasPermission>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </motion.div>

          {/* Barre d'actions en masse flottante */}
          <BulkActionBar
            selectedCount={bulkSelection.selectedCount}
            totalCount={filteredEmployees.length}
            isAllPageSelected={bulkSelection.isAllPageSelected}
            onClearSelection={bulkSelection.clearSelection}
            primaryActions={bulkPrimaryActions}
            secondaryActions={bulkSecondaryActions}
            itemName="employé"
            itemPlural="employés"
          />

          {/* Modale de confirmation Bulk */}
          <BulkConfirmModal
            isOpen={bulkConfirm.open}
            onClose={() => setBulkConfirm((prev) => ({ ...prev, open: false }))}
            onConfirm={handleExecuteBulkAction}
            title={bulkConfirm.title}
            description={bulkConfirm.description}
            count={bulkSelection.selectedCount}
            actionType={bulkConfirm.actionType}
            isDestructive={bulkConfirm.isDestructive}
            confirmLabel={bulkConfirm.confirmLabel}
            warningMessage={bulkConfirm.warningMessage}
            options={bulkConfirm.options}
            optionsLabel={bulkConfirm.optionsLabel}
            isLoading={isBulkExecuting}
          />

          {/* Modale de rapport post-exécution */}
          <BulkResultModal
            isOpen={bulkResult.open}
            onClose={() => setBulkResult({ open: false, result: null })}
            result={bulkResult.result}
            title="Résultat de l'action sur les employés"
          />

          {/* Modals classiques */}
          <EmployeeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            employeeToEdit={employeeToEdit}
            companyId={activeCompany?.id}
            onEmployeeSaved={fetchEmployeesList}
          />

          <DeleteEmployeeDialog
            employee={employeeToDelete}
            open={!!employeeToDelete}
            onOpenChange={(open) => !open && setEmployeeToDelete(null)}
            companyId={activeCompany?.id}
            onEmployeeDeleted={fetchEmployeesList}
          />
        </div>
      </PermissionGuard>
    </FeatureLockedOverlay>
  );
}

