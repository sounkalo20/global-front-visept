import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import useCompanyStore from '@/store/companyStore';

export default function RegisterAssignmentModal({ open, onOpenChange, registerItem }) {
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { activeCompany } = useCompanyStore();

  useEffect(() => {
    if (open && registerItem && activeCompany) {
      fetchUsersAndAssignments();
    }
  }, [open, registerItem, activeCompany]);

  const fetchUsersAndAssignments = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch assigned users
      const assignedRes = await api.get(`/cash/registers/${registerItem.id}/users?company_id=${activeCompany.id}`);
      const assigned = assignedRes.data.data || [];
      setAssignedUsers(assigned);

      // 2. Fetch all employees in the company
      const employeesRes = await api.get(`/employees?company_id=${activeCompany.id}`);
      const allEmployees = employeesRes.data.data?.employees || [];
      
      // Filter out those who are already assigned
      const assignedIds = new Set(assigned.map(u => u.id));
      setAvailableUsers(allEmployees.filter(emp => !assignedIds.has(emp.id)));
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du chargement des données.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (userId) => {
    try {
      await api.post(`/cash/registers/assign`, {
        company_id: activeCompany.id,
        cash_register_id: registerItem.id,
        user_id: userId
      });
      toast.success('Utilisateur assigné.');
      fetchUsersAndAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation.');
    }
  };

  const handleUnassign = async (userId) => {
    try {
      await api.post(`/cash/registers/unassign`, {
        company_id: activeCompany.id,
        cash_register_id: registerItem.id,
        user_id: userId
      });
      toast.success('Assignation retirée.');
      fetchUsersAndAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du retrait.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Caissiers assignés à {registerItem?.name}</DialogTitle>
          <DialogDescription>
            Gérez qui a le droit d'utiliser cette caisse physique.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="animate-spin text-brand-600" size={32} />
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#F9FAFB] mb-3 border-b border-gray-100 dark:border-[#374151] pb-2">Utilisateurs assignés</h3>
              {assignedUsers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-[#9CA3AF] italic">Aucun utilisateur assigné à cette caisse.</p>
              ) : (
                <ul className="space-y-2">
                  {assignedUsers.map(user => (
                    <li key={user.id} className="flex justify-between items-center bg-gray-50 dark:bg-[#1F2937]/50 p-2.5 rounded-xl border border-gray-200 dark:border-[#374151]">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 dark:text-[#F9FAFB]">{user.first_name} {user.last_name}</span>
                        <span className="text-xs text-gray-500 dark:text-[#D1D5DB]">{user.email}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleUnassign(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40">
                        <UserMinus size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#F9FAFB] mb-3 border-b border-gray-100 dark:border-[#374151] pb-2">Ajouter un utilisateur</h3>
              {availableUsers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-[#9CA3AF] italic">Tous les employés sont déjà assignés.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {availableUsers.map(emp => (
                    <li key={emp.id} className="flex justify-between items-center bg-white dark:bg-[#111827] p-2.5 rounded-xl border border-gray-200 dark:border-[#374151]">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 dark:text-[#F9FAFB]">{emp.first_name} {emp.last_name}</span>
                        <span className="text-xs text-gray-500 dark:text-[#D1D5DB]">{emp.email}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAssign(emp.id)} className="text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 border-gray-200 dark:border-[#374151]">
                        <UserPlus size={16} className="mr-1" />
                        Assigner
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
