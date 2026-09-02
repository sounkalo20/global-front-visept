'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Utensils,
  Receipt,
  Sparkles,
  Bookmark,
  Ban,
  RefreshCw,
  Plus,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import useRestaurantTableStore from '@/store/restaurantTableStore';
import useCompanyStore from '@/store/companyStore';

import SpaceTabs from '@/components/restaurant/tables/SpaceTabs';
import TableGridCard from '@/components/restaurant/tables/TableGridCard';
import FloorPlanView from '@/components/restaurant/tables/FloorPlanView';

import OpenTableModal from '@/components/restaurant/tables/OpenTableModal';
import TableDetailModal from '@/components/restaurant/tables/TableDetailModal';
import TransferTableModal from '@/components/restaurant/tables/TransferTableModal';
import MergeTableModal from '@/components/restaurant/tables/MergeTableModal';
import ReserveTableModal from '@/components/restaurant/tables/ReserveTableModal';

export default function RestaurantTablesPage() {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const {
    spaces,
    tables,
    stats,
    activeSpaceId,
    viewMode,
    isLoading,
    fetchSpaces,
    fetchTables,
    setActiveSpaceId,
    setViewMode,
    openSession,
    updateTableStatus,
    transferTable,
    mergeTables,
    savePositions,
  } = useRestaurantTableStore();

  // Modals state
  const [selectedTable, setSelectedTable] = useState(null);
  const [openModalOpen, setOpenModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);

  // Polling temps réel (8 secondes)
  useEffect(() => {
    if (activeCompany) {
      fetchSpaces();
      fetchTables();

      const interval = setInterval(() => {
        fetchTables();
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [activeCompany, activeSpaceId]);

  const handleTableClick = (table) => {
    setSelectedTable(table);

    if (table.status === 'available') {
      setOpenModalOpen(true);
    } else if (table.status === 'reserved') {
      setOpenModalOpen(true);
    } else {
      setDetailModalOpen(true);
    }
  };

  // Actions
  const handleConfirmOpen = async (tableId, guests) => {
    const res = await openSession(tableId, guests);
    if (res.success) {
      toast.success('Table ouverte ! Chargement du POS...');
      router.push(`/restaurant/sales/new?table_id=${tableId}`);
    } else {
      toast.error(res.message);
    }
    return res;
  };

  const handleOpenPos = (table) => {
    router.push(`/restaurant/sales/new?table_id=${table.id}`);
  };

  const availableTables = tables.filter((t) => t.status === 'available');
  const occupiedTables = tables.filter((t) => t.status === 'occupied' || t.status === 'bill_requested');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Salle & Plan des Tables</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Suivi visuel des tables et sessions ouvertes pour <span className="font-semibold text-brand-600">{activeCompany?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTables()}
            className="rounded-xl gap-1 text-gray-600"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </Button>

          <Button
            onClick={() => router.push('/restaurant/tables/manage')}
            size="sm"
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl gap-1.5"
          >
            <Settings size={16} />
            Gérer la salle
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques globales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
          <div className="p-2.5 rounded-xl bg-gray-100 text-gray-700">
            <Utensils size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Tables</p>
            <p className="text-lg font-bold text-gray-900">{stats?.total || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm bg-emerald-50/30">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Libres</p>
            <p className="text-lg font-bold text-emerald-700">{stats?.available || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-rose-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm bg-rose-50/30">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
            <Utensils size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Occupées</p>
            <p className="text-lg font-bold text-rose-700">{stats?.occupied || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm bg-amber-50/30">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
            <Receipt size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Addition demandée</p>
            <p className="text-lg font-bold text-amber-800">{stats?.bill_requested || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm bg-slate-50/30">
          <div className="p-2.5 rounded-xl bg-slate-200 text-slate-700">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">À nettoyer</p>
            <p className="text-lg font-bold text-slate-700">{stats?.needs_cleaning || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-purple-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm bg-purple-50/30">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700">
            <Bookmark size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Réservées</p>
            <p className="text-lg font-bold text-purple-700">{stats?.reserved || 0}</p>
          </div>
        </div>
      </div>

      {/* Onglets des Espaces & Filtres */}
      <SpaceTabs
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        onSelectSpace={setActiveSpaceId}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onOpenManage={() => router.push('/restaurant/tables/manage')}
      />

      {/* Rendu Grille ou Plan 2D */}
      {isLoading && tables.length === 0 ? (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-white border border-dashed rounded-2xl p-16 text-center space-y-4">
          <Utensils size={48} className="mx-auto text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-700">Aucune table configurée</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Commencez par créer des espaces (Salle, Terrasse...) et ajouter vos tables physiques.
          </p>
          <Button onClick={() => router.push('/restaurant/tables/manage')} className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl">
            <Plus size={16} className="mr-2" /> Configurer la salle
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <TableGridCard
              key={table.id}
              table={table}
              showSpaceName={activeSpaceId === null}
              onClick={handleTableClick}
            />
          ))}
        </div>
      ) : (
        <FloorPlanView
          tables={tables}
          isEditable={true}
          onSelectTable={handleTableClick}
          onSavePositions={savePositions}
        />
      )}

      {/* MODALS DE GESTION DE TABLE */}
      <OpenTableModal
        open={openModalOpen}
        onOpenChange={setOpenModalOpen}
        table={selectedTable}
        onConfirmOpen={handleConfirmOpen}
        onOpenReserve={(tbl) => {
          setSelectedTable(tbl);
          setReserveModalOpen(true);
        }}
      />

      <TableDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        table={selectedTable}
        onOpenPos={handleOpenPos}
        onUpdateStatus={updateTableStatus}
        onOpenTransfer={(tbl) => {
          setSelectedTable(tbl);
          setTransferModalOpen(true);
        }}
        onOpenMerge={(tbl) => {
          setSelectedTable(tbl);
          setMergeModalOpen(true);
        }}
      />

      <TransferTableModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        table={selectedTable}
        availableTables={availableTables}
        onConfirmTransfer={transferTable}
      />

      <MergeTableModal
        open={mergeModalOpen}
        onOpenChange={setMergeModalOpen}
        primaryTable={selectedTable}
        occupiedTables={occupiedTables}
        onConfirmMerge={mergeTables}
      />

      <ReserveTableModal
        open={reserveModalOpen}
        onOpenChange={setReserveModalOpen}
        table={selectedTable}
        onConfirmReserve={updateTableStatus}
      />
    </div>
  );
}
