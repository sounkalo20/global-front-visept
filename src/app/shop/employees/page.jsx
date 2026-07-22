'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Mail, Phone, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useCompanyStore from '@/store/companyStore';
import { getEmployees } from '@/lib/api/employees';
import EmployeeModal from '@/components/employees/EmployeeModal';
import DeleteEmployeeDialog from '@/components/employees/DeleteEmployeeDialog';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const { activeCompany } = useCompanyStore();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const fetchEmployeesList = useCallback(async () => {
    if (!activeCompany?.id) return;
    setIsLoading(true);
    try {
      const data = await getEmployees(activeCompany.id);
      setEmployees(data.data.employees);
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setIsLoading(false);
    }
  }, [activeCompany?.id]);

  useEffect(() => {
    fetchEmployeesList();
  }, [fetchEmployeesList]);

  const handleOpenModal = (employee = null) => {
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  const filteredEmployees = employees.filter((emp) => {
    const term = searchQuery.toLowerCase();
    return (
      emp.first_name.toLowerCase().includes(term) ||
      emp.last_name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term)
    );
  });

  if (!activeCompany) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
            <p className="text-gray-500 mt-1">
              Gérez les accès et les membres de votre boutique.
            </p>
          </div>
          <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
            <Plus size={18} className="mr-2" />
            Ajouter un employé
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table / List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm">
            <UserIcon className="mx-auto mb-3 text-gray-400" size={32} />
            <h3 className="text-lg font-medium text-gray-900">Aucun employé trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Essayez une autre recherche' : 'Commencez par ajouter un employé à votre boutique'}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenModal()} variant="outline" className="mt-4">
                <Plus size={18} className="mr-2" />
                Ajouter
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nom & Prénom</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Rôle</th>
                    <th className="px-6 py-4 font-medium">Date d'ajout</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-semibold">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                            {!emp.is_active && (
                              <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                Inactif
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center text-gray-500">
                          <Mail size={14} className="mr-2" />
                          {emp.email}
                        </div>
                        {emp.phone && (
                          <div className="flex items-center text-gray-500">
                            <Phone size={14} className="mr-2" />
                            {emp.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {emp.role === 'manager' ? 'Gérant' : emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(emp.joined_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(emp)}
                            className="text-gray-500 hover:text-brand-600"
                            title="Modifier"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEmployeeToDelete(emp)}
                            className="text-gray-500 hover:text-red-600"
                            title="Retirer"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </motion.div>

      {/* Modals */}
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
  );
}
