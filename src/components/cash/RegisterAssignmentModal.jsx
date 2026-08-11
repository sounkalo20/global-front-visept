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
              <h3 className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">Utilisateurs assignés</h3>
              {assignedUsers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Aucun utilisateur assigné à cette caisse.</p>
              ) : (
                <ul className="space-y-2">
                  {assignedUsers.map(user => (
                    <li key={user.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleUnassign(user.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                        <UserMinus size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">Ajouter un utilisateur</h3>
              {availableUsers.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Tous les employés sont déjà assignés.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {availableUsers.map(emp => (
                    <li key={emp.id} className="flex justify-between items-center bg-white p-2 rounded-lg border">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{emp.first_name} {emp.last_name}</span>
                        <span className="text-xs text-gray-500">{emp.email}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleAssign(emp.id)} className="text-brand-600 hover:bg-brand-50 hover:text-brand-700">
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
