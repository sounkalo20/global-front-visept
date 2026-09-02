'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, ArrowLeft, Building2, Users, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useRestaurantTableStore from '@/store/restaurantTableStore';
import useCompanyStore from '@/store/companyStore';

export default function ManageTablesPage() {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const {
    spaces,
    tables,
    fetchSpaces,
    fetchTables,
    createSpace,
    updateSpace,
    deleteSpace,
    createTable,
    updateTable,
  } = useRestaurantTableStore();

  // Dialog state pour espaces
  const [spaceModalOpen, setSpaceModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [spaceForm, setSpaceForm] = useState({ name: '', description: '', sort_order: 0 });

  // Dialog state pour tables
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableForm, setTableForm] = useState({
    table_number: '',
    table_name: '',
    capacity: 4,
    space_id: '',
    shape: 'square',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeCompany) {
      fetchSpaces();
      fetchTables();
    }
  }, [activeCompany]);

  // ── ESPACES HANDLERS ──────────────────────────────────────
  const handleOpenCreateSpace = () => {
    setEditingSpace(null);
    setSpaceForm({ name: '', description: '', sort_order: spaces.length });
    setSpaceModalOpen(true);
  };

  const handleOpenEditSpace = (space) => {
    setEditingSpace(space);
    setSpaceForm({ name: space.name, description: space.description || '', sort_order: space.sort_order });
    setSpaceModalOpen(true);
  };

  const handleSaveSpace = async (e) => {
    e.preventDefault();
    if (!spaceForm.name.trim()) { toast.error('Le nom est requis.'); return; }

    setIsSubmitting(true);
    const res = editingSpace
      ? await updateSpace(editingSpace.id, spaceForm)
      : await createSpace(spaceForm);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(editingSpace ? 'Espace mis à jour.' : 'Espace créé.');
      setSpaceModalOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteSpace = async (space) => {
    if (!window.confirm(`Désactiver l'espace "${space.name}" ?`)) return;
    const res = await deleteSpace(space.id);
    if (res.success) toast.success('Espace désactivé/supprimé.');
    else toast.error(res.message);
  };

  // ── TABLES HANDLERS ───────────────────────────────────────
  const handleOpenCreateTable = () => {
    setEditingTable(null);
    setTableForm({
      table_number: String(tables.length + 1).padStart(2, '0'),
      table_name: '',
      capacity: 4,
      space_id: spaces[0]?.id ? String(spaces[0].id) : '',
      shape: 'square',
    });
    setTableModalOpen(true);
  };

  const handleOpenEditTable = (table) => {
    setEditingTable(table);
    setTableForm({
      table_number: table.table_number || '',
      table_name: table.table_name || '',
      capacity: table.capacity || 4,
      space_id: table.space_id ? String(table.space_id) : '',
      shape: table.shape || 'square',
    });
    setTableModalOpen(true);
  };

  const handleSaveTable = async (e) => {
    e.preventDefault();
    if (!tableForm.table_number && !tableForm.table_name) {
      toast.error('Indiquez un numéro ou nom de table.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...tableForm,
      space_id: tableForm.space_id ? Number(tableForm.space_id) : null,
      capacity: Number(tableForm.capacity),
    };

    const res = editingTable
      ? await updateTable(editingTable.id, payload)
      : await createTable(payload);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(editingTable ? 'Table mise à jour.' : 'Table créée.');
      setTableModalOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  const handleToggleTableActive = async (table) => {
    const res = await updateTable(table.id, { is_active: !table.is_active });
    if (res.success) toast.success(table.is_active ? 'Table désactivée.' : 'Table activée.');
    else toast.error(res.message);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/restaurant/tables')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuration de la salle</h1>
            <p className="text-sm text-gray-500">Gérez les espaces (zones) et les tables physiques de votre établissement</p>
          </div>
        </div>
      </div>

      {/* ── SECTION 1 : ESPACES (ZONES) ────────────────────── */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="text-brand-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Espaces (Zones)</h2>
          </div>
          <Button onClick={handleOpenCreateSpace} size="sm" className="bg-brand-600 hover:bg-brand-700 text-white">
            <Plus size={16} className="mr-1" /> Nouvel espace
          </Button>
        </div>

        {spaces.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4">Aucun espace configuré (ex: Salle principale, Terrasse, VIP...).</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {spaces.map((space) => (
              <div key={space.id} className="p-4 border rounded-xl bg-gray-50/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{space.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{space.tables_count || 0} table(s) associée(s)</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditSpace(space)}>
                    <Edit2 size={16} className="text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteSpace(space)} className="text-red-500">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 2 : TABLES ──────────────────────────────── */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="text-brand-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Tables physiques ({tables.length})</h2>
          </div>
          <Button onClick={handleOpenCreateTable} size="sm" className="bg-brand-600 hover:bg-brand-700 text-white">
            <Plus size={16} className="mr-1" /> Nouvelle table
          </Button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro / Nom</TableHead>
                <TableHead>Espace</TableHead>
                <TableHead>Capacité</TableHead>
                <TableHead>Forme</TableHead>
                <TableHead>Statut Actuel</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((tbl) => (
                <TableRow key={tbl.id} className={!tbl.is_active ? 'opacity-50' : ''}>
                  <TableCell className="font-bold">
                    {tbl.table_number ? `Table ${tbl.table_number}` : tbl.table_name}
                  </TableCell>
                  <TableCell>{tbl.space_name || '-'}</TableCell>
                  <TableCell>{tbl.capacity} places</TableCell>
                  <TableCell className="capitalize">{tbl.shape}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{tbl.status.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditTable(tbl)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleTableActive(tbl)}
                        className={tbl.is_active ? 'text-red-500' : 'text-green-600'}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── MODAL ESPACE ────────────────────────────────────── */}
      <Dialog open={spaceModalOpen} onOpenChange={setSpaceModalOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingSpace ? 'Modifier l\'espace' : 'Nouveau espace'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSpace} className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de l'espace *</label>
              <Input
                placeholder="Ex: Salle principale, Terrasse, VIP..."
                value={spaceForm.name}
                onChange={(e) => setSpaceForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                placeholder="Ex: Espace extérieur ombragé..."
                value={spaceForm.description}
                onChange={(e) => setSpaceForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setSpaceModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white">
                {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL TABLE ─────────────────────────────────────── */}
      <Dialog open={tableModalOpen} onOpenChange={setTableModalOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingTable ? 'Modifier la table' : 'Nouvelle table'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveTable} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Numéro de table</label>
                <Input
                  placeholder="Ex: 01, 02..."
                  value={tableForm.table_number}
                  onChange={(e) => setTableForm((f) => ({ ...f, table_number: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom personnalisé</label>
                <Input
                  placeholder="Ex: VIP 1"
                  value={tableForm.table_name}
                  onChange={(e) => setTableForm((f) => ({ ...f, table_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Espace (Zone)</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  value={tableForm.space_id}
                  onChange={(e) => setTableForm((f) => ({ ...f, space_id: e.target.value }))}
                >
                  <option value="">Aucun espace</option>
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Capacité (personnes)</label>
                <Input
                  type="number"
                  min="1"
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm((f) => ({ ...f, capacity: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Forme visuelle</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                value={tableForm.shape}
                onChange={(e) => setTableForm((f) => ({ ...f, shape: e.target.value }))}
              >
                <option value="square">Carrée / Rectangle</option>
                <option value="round">Ronde</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setTableModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white">
                {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
