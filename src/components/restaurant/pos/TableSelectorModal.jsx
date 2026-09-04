'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Utensils, Users, UserCheck, Play } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import useCompanyStore from '@/store/companyStore';
import { getEmployees } from '@/lib/api/employees';

export default function TableSelectorModal({ isOpen, onClose, onSelectTable }) {
  const { activeCompany } = useCompanyStore();
  const [tables, setTables] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form de création de session
  const [selectedTable, setSelectedTable] = useState(null);
  const [guestsCount, setGuestsCount] = useState(2);
  const [assignedWaiterId, setAssignedWaiterId] = useState('');
  const [isOpeningSession, setIsOpeningSession] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeCompany?.id || !isOpen) return;
      setIsLoading(true);
      try {
        const tablesRes = await axios.get('/restaurant/tables', {
          headers: activeCompany?.id ? { 'x-company-id': activeCompany.id } : {}
        });
        if (tablesRes.data?.success) {
          setTables(tablesRes.data.data?.tables || []);
        }

        try {
          const empRes = await getEmployees(activeCompany.id);
          setEmployees(empRes.data?.employees || empRes.data || []);
        } catch (e) {
          setEmployees([]);
        }
      } catch (err) {
        console.error('Erreur chargement tables:', err);
        toast.error(err.response?.data?.message || 'Erreur lors du chargement des tables');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCompany?.id, isOpen]);

  const handleOpenSession = async () => {
    if (!selectedTable) return;
    if (selectedTable.capacity && Number(guestsCount) > selectedTable.capacity) {
      toast.error(`Cette table ne peut accueillir que ${selectedTable.capacity} personnes.`);
      return;
    }

    setIsOpeningSession(true);
    try {
      const res = await axios.post(
        '/restaurant/tables/open-session',
        {
          table_id: selectedTable.id,
          number_of_guests: Number(guestsCount),
          staff_id: assignedWaiterId || null,
        },
        { headers: { 'x-company-id': activeCompany.id } }
      );

      if (res.data.success) {
        toast.success(`Table #${selectedTable.table_number || selectedTable.table_name} ouverte avec succès !`);
        onSelectTable(selectedTable, res.data.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l ouverture de la table.');
    } finally {
      setIsOpeningSession(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Utensils className="text-amber-600" size={20} />
            Sélectionner une Table — Restaurant
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-amber-600" size={28} />
            <span>Chargement des tables...</span>
          </div>
        ) : (
          <div className="space-y-4 my-2 overflow-y-auto flex-1 pr-1">
            {/* Étape 1 : Choix de la Table */}
            {!selectedTable ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {tables.map((t) => {
                  const isOccupied = t.status === 'occupied' || t.status === 'bill_requested';

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (isOccupied) {
                          onSelectTable(t, { id: t.current_session_id });
                        } else {
                          setSelectedTable(t);
                          setGuestsCount(Math.min(2, t.capacity || 4));
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        isOccupied
                          ? 'bg-red-50 border-red-200 text-red-900 hover:bg-red-100'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-base">#{t.table_number || t.table_name}</span>
                        <Badge className={isOccupied ? 'bg-red-600 text-white text-[10px]' : 'bg-emerald-600 text-white text-[10px]'}>
                          {isOccupied ? 'Occupée' : 'Libre'}
                        </Badge>
                      </div>

                      <div className="text-xs font-semibold text-gray-600 flex items-center gap-1 mt-2">
                        <Users size={12} />
                        <span>Capacité : {t.capacity || 4} pers.</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Étape 2 : Configuration de la nouvelle session */
              <div className="bg-slate-50 border rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h4 className="font-extrabold text-base text-gray-900">
                      Ouverture de la Table #{selectedTable.table_number || selectedTable.table_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">Capacité maximale : {selectedTable.capacity} personnes</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTable(null)} className="text-xs">
                    Changer de table
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Nombre de couverts (Clients) :</label>
                    <Input
                      type="number"
                      min={1}
                      max={selectedTable.capacity || 10}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className="font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Serveur Responsable :</label>
                    <select
                      value={assignedWaiterId}
                      onChange={(e) => setAssignedWaiterId(e.target.value)}
                      className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold"
                    >
                      <option value="">-- M'assigner comme serveur --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name || ''} ({emp.role_name || 'Staff'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handleOpenSession}
                    disabled={isOpeningSession}
                    className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs mt-2"
                  >
                    {isOpeningSession ? (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    ) : (
                      <>
                        <Play size={16} className="mr-2" /> Ouvrir la Session & Prise de Commande
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
