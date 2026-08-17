'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import InventorySessionList from '@/components/inventory/InventorySessionList';
import CreateInventoryModal from '@/components/inventory/CreateInventoryModal';
import useInventoryStore from '@/store/inventoryStore';
import useCompanyStore from '@/store/companyStore';
import useCategoryStore from '@/store/categoryStore';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import HasPermission from '@/components/auth/HasPermission';

export default function InventoryPage() {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { sessions, dashboard, isLoading, fetchSessions, fetchDashboard } = useInventoryStore();
  const { fetchCategories } = useCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = useCallback(async () => {
    if (activeCompany) {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      await Promise.all([
        fetchSessions(params),
        fetchDashboard(),
        fetchCategories(activeCompany.id),
      ]);
    }
  }, [activeCompany, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSessionCreated = () => {
    setModalOpen(false);
    loadData();
  };

  if (!activeCompany) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">Aucune entreprise active</h2>
        <p className="text-gray-400 mt-1">Sélectionnez une entreprise pour accéder aux inventaires.</p>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="inventory.view">
      <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventaires Physiques</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Contrôlez et ajustez vos stocks réels en toute traçabilité
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              Actualiser
            </Button>
            <HasPermission required="inventory.count">
              <Button onClick={() => setModalOpen(true)} className="gap-2">
                <Plus size={16} />
                Nouvel inventaire
              </Button>
            </HasPermission>
          </div>
        </div>

        {/* Dashboard KPI */}
        <InventoryDashboard dashboard={dashboard} />

        {/* Filtres statuts */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Filtrer :</span>
          {[
            { value: '', label: 'Tous' },
            { value: 'draft', label: 'Brouillons' },
            { value: 'in_progress', label: 'En cours' },
            { value: 'completed', label: 'Complétés' },
            { value: 'validated', label: 'Validés' },
            { value: 'canceled', label: 'Annulés' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : (
          <InventorySessionList sessions={sessions} onRefresh={loadData} />
        )}
      </motion.div>

      <CreateInventoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleSessionCreated}
      />
    </div>
    </PermissionGuard>
  );
}
