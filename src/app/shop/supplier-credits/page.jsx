// src/app/shop/supplier-credits/page.jsx
'use client';
import { useState, useEffect } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Truck,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  FileText,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useCompanyStore from '@/store/companyStore';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function SupplierCreditsPage() {
  const { activeCompany } = useCompanyStore();

  const [credits, setCredits] = useState([]);
  const [summary, setSummary] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtres
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [creditDetails, setCreditDetails] = useState(null);
  const [supplierOrders, setSupplierOrders] = useState([]);

  // Formulaire Création
  const [newCredit, setNewCredit] = useState({
    supplier_id: '',
    amount: '',
    reason: '',
    origin_order_id: '',
    notes: '',
  });

  // Formulaire Application
  const [applyForm, setApplyForm] = useState({
    supplier_order_id: '',
    amount_applied: '',
    notes: '',
  });

  const companyId = activeCompany?.id;

  const fetchCredits = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      let url = `/supplier-credits?company_id=${companyId}`;
      if (supplierFilter !== 'all') url += `&supplier_id=${supplierFilter}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setCredits(res.data.data.credits || []);
        setSummary(res.data.data.summary || {});
      }
    } catch (error) {
      console.error('Erreur chargement avoirs:', error);
      toast.error('Impossible de charger les avoirs fournisseurs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    if (!companyId) return;
    try {
      const res = await api.get(`/suppliers?company_id=${companyId}&limit=200`);
      if (res.data?.success) {
        const list = Array.isArray(res.data.data?.suppliers)
          ? res.data.data.suppliers
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setSuppliers(list);
      }
    } catch (e) {
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchCredits();
    fetchSuppliers();
  }, [companyId, supplierFilter, statusFilter]);

  // Ouvrir modal d'application
  const openApplyModal = async (credit) => {
    setSelectedCredit(credit);
    setApplyForm({
      supplier_order_id: '',
      amount_applied: String(credit.remaining_amount),
      notes: '',
    });

    try {
      // Récupérer les commandes non clôturées de ce fournisseur ayant un solde restant
      const res = await api.get(
        `/supplier-orders?company_id=${companyId}&supplier_id=${credit.supplier_id}&limit=50`
      );
      if (res.data?.success) {
        const orders = (res.data.data.orders || []).filter(
          (o) => parseFloat(o.remaining_balance) > 0 && o.status !== 'canceled'
        );
        setSupplierOrders(orders);
        setIsApplyOpen(true);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des commandes du fournisseur');
    }
  };

  // Ouvrir modal de détails
  const openDetailsModal = async (creditId) => {
    try {
      const res = await api.get(`/supplier-credits/${creditId}?company_id=${companyId}`);
      if (res.data?.success) {
        setCreditDetails(res.data.data);
        setIsDetailsOpen(true);
      }
    } catch (error) {
      toast.error('Impossible de charger le détail de l\'avoir');
    }
  };

  // Créer un avoir
  const handleCreateCredit = async (e) => {
    e.preventDefault();
    if (!newCredit.supplier_id || !newCredit.amount) {
      toast.error('Fournisseur et montant requis');
      return;
    }

    try {
      const res = await api.post(`/supplier-credits?company_id=${companyId}`, newCredit);
      if (res.data?.success) {
        toast.success(res.data.message || 'Avoir créé avec succès');
        setIsCreateOpen(false);
        setNewCredit({ supplier_id: '', amount: '', reason: '', origin_order_id: '', notes: '' });
        fetchCredits();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de l\'avoir');
    }
  };

  // Appliquer l'avoir
  const handleApplyCredit = async (e) => {
    e.preventDefault();
    if (!applyForm.supplier_order_id || !applyForm.amount_applied) {
      toast.error('Veuillez sélectionner une commande et saisir le montant à appliquer');
      return;
    }

    try {
      const res = await api.post(
        `/supplier-credits/${selectedCredit.id}/apply?company_id=${companyId}`,
        applyForm
      );
      if (res.data?.success) {
        toast.success(res.data.message || 'Avoir appliqué avec succès');
        setIsApplyOpen(false);
        fetchCredits();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'application de l\'avoir');
    }
  };

  // Annuler un avoir
  const handleCancelCredit = async (creditId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cet avoir ? Cette action est irréversible.')) return;
    try {
      const res = await api.put(`/supplier-credits/${creditId}/cancel?company_id=${companyId}`);
      if (res.data?.success) {
        toast.success('Avoir fournisseur annulé');
        fetchCredits();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 size={12} /> Disponible
          </span>
        );
      case 'partially_used':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            ● Partiellement utilisé
          </span>
        );
      case 'used':
        return (
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            Totalement consommé
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            Annulé
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <RotateCcw size={22} />
            </div>
            Avoirs Fournisseurs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez les notes de crédit accordées par vos fournisseurs et déduisez-les de vos commandes d'achat.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="gap-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-xs"
            title="Enregistrer une nouvelle note de crédit émise par un fournisseur"
          >
            <Plus size={16} /> Nouvel Avoir Fournisseur
          </Button>

          <Button
            onClick={fetchCredits}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-900"
            title="Actualiser la liste"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
              Solde d'Avoirs Disponible
              <span title="Montant total des avoirs utilisables pour réduire les dettes futures">
                <HelpCircle size={13} className="text-gray-400 cursor-help" />
              </span>
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {parseFloat(summary.total_remaining_available || 0).toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {summary.available_count || 0} avoir(s) 100% disponible(s)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Total Avoirs Utilisés
            </span>
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-2">
              {parseFloat(summary.total_used || 0).toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Déduits sur vos commandes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Total Émis Historique
            </span>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {parseFloat(summary.total_amount || 0).toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {summary.total_credits || 0} avoir(s) au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de filtres */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-52">
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <Truck size={13} className="mr-1 text-gray-400" />
                  <SelectValue placeholder="Fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fournisseurs</SelectItem>
                  {Array.isArray(suppliers) && suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-44">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <Filter size={13} className="mr-1 text-gray-400" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="available">🟢 Disponible</SelectItem>
                  <SelectItem value="partially_used">🟡 Partiellement utilisé</SelectItem>
                  <SelectItem value="used">⚪ Totalement consommé</SelectItem>
                  <SelectItem value="canceled">🔴 Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher référence, motif..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCredits()}
              className="h-9 text-xs pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des avoirs */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Fournisseur</th>
                <th className="py-3 px-4">Motif / Origine</th>
                <th className="py-3 px-4 text-right">Montant Initial</th>
                <th className="py-3 px-4 text-right">Solde Disponible</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Chargement des avoirs...
                  </td>
                </tr>
              ) : credits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 dark:text-gray-500">
                    Aucun avoir fournisseur enregistré.
                  </td>
                </tr>
              ) : (
                credits.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {c.reference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                      {c.supplier_name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate" title={c.reason}>
                      {c.reason || 'Avoir commercial'}
                      {c.origin_order_number && (
                        <span className="text-[10px] text-brand-600 dark:text-brand-400 block font-mono">
                          Sur commande : {c.origin_order_number}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {parseFloat(c.amount).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {parseFloat(c.remaining_amount).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {parseFloat(c.remaining_amount) > 0 && c.status !== 'canceled' && (
                          <Button
                            size="sm"
                            onClick={() => openApplyModal(c)}
                            className="h-7 px-2 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                            title="Appliquer cet avoir sur une commande du fournisseur"
                          >
                            Appliquer
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsModal(c.id)}
                          className="h-7 px-2 text-[11px] text-gray-600 hover:text-brand-600"
                          title="Voir la traçabilité des déductions"
                        >
                          Détails
                        </Button>
                        {c.status === 'available' && parseFloat(c.remaining_amount) === parseFloat(c.amount) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelCredit(c.id)}
                            className="h-7 px-2 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Annuler l'avoir"
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─── MODAL CRÉATION AVOIR ───────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RotateCcw size={18} className="text-brand-600" />
              Créer un Avoir Fournisseur
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Enregistrez une note de crédit ou remise accordée par un fournisseur.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCredit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Fournisseur *</Label>
              <Select
                value={newCredit.supplier_id}
                onValueChange={(val) => setNewCredit({ ...newCredit, supplier_id: val })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(suppliers) && suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Montant de l'avoir (FCFA) *</Label>
              <Input
                type="number"
                min="1"
                step="any"
                placeholder="Ex: 50000"
                value={newCredit.amount}
                onChange={(e) => setNewCredit({ ...newCredit, amount: e.target.value })}
                className="h-9 text-xs font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Motif de l'avoir</Label>
              <Input
                placeholder="Ex: Retour marchandise défectueuse, remise commerciale..."
                value={newCredit.reason}
                onChange={(e) => setNewCredit({ ...newCredit, reason: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes internes / Réf externe</Label>
              <Textarea
                placeholder="Commentaires ou références du bon de crédit fournisseur..."
                value={newCredit.notes}
                onChange={(e) => setNewCredit({ ...newCredit, notes: e.target.value })}
                className="text-xs resize-none h-20"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white"
              >
                Enregistrer l'avoir
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL APPLICATION AVOIR ────────────────────────────────── */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Appliquer l'Avoir {selectedCredit?.reference}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Déduire tout ou partie de cet avoir sur une commande fournisseur en cours.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplyCredit} className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs">
              <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                Solde disponible sur cet avoir :{' '}
                <span className="font-bold text-sm">
                  {parseFloat(selectedCredit?.remaining_amount || 0).toLocaleString('fr-FR')} FCFA
                </span>
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                Fournisseur : {selectedCredit?.supplier_name}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Commande fournisseur cible *</Label>
              {supplierOrders.length === 0 ? (
                <p className="text-xs text-rose-500 p-2 rounded-lg bg-rose-50 border border-rose-200">
                  Aucune commande avec solde restant n'a été trouvée pour ce fournisseur.
                </p>
              ) : (
                <Select
                  value={applyForm.supplier_order_id}
                  onValueChange={(val) => {
                    const ord = supplierOrders.find((o) => String(o.id) === String(val));
                    const maxPossible = Math.min(
                      parseFloat(selectedCredit.remaining_amount),
                      parseFloat(ord?.remaining_balance || 0)
                    );
                    setApplyForm({
                      ...applyForm,
                      supplier_order_id: val,
                      amount_applied: String(maxPossible),
                    });
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Choisir un bon de commande" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierOrders.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.order_number} — Reste dû : {parseFloat(o.remaining_balance).toLocaleString('fr-FR')} FCFA
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Montant à déduire (FCFA) *</Label>
              <Input
                type="number"
                min="1"
                step="any"
                value={applyForm.amount_applied}
                onChange={(e) => setApplyForm({ ...applyForm, amount_applied: e.target.value })}
                className="h-9 text-xs font-bold"
                required
              />
              <p className="text-[10px] text-gray-400">
                Vous pouvez appliquer un montant partiel pour conserver le reste pour d'autres commandes.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Note / Justificatif</Label>
              <Input
                placeholder="Ex: Déduction convenue lors de la livraison..."
                value={applyForm.notes}
                onChange={(e) => setApplyForm({ ...applyForm, notes: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsApplyOpen(false)}
                className="text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={supplierOrders.length === 0}
                size="sm"
                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Valider la déduction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL DÉTAILS & HISTORIQUE APPLICATIONS ───────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-brand-600" />
              Traçabilité Avoir {creditDetails?.credit?.reference}
            </DialogTitle>
          </DialogHeader>

          {creditDetails && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                <div>
                  <span className="text-gray-400 block">Fournisseur</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {creditDetails.credit.supplier_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Date d'émission</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(creditDetails.credit.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Montant initial</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {parseFloat(creditDetails.credit.amount).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Solde restant disponible</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {parseFloat(creditDetails.credit.remaining_amount).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  Historique des déductions sur commandes :
                </h4>
                {creditDetails.applications.length === 0 ? (
                  <p className="text-gray-400 italic p-3 text-center border rounded-xl border-dashed">
                    Cet avoir n'a encore été déduit sur aucune commande.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 border rounded-xl overflow-hidden">
                    {creditDetails.applications.map((app) => (
                      <div key={app.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-brand-600 dark:text-brand-400 font-mono">
                            Commande #{app.order_number}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Appliqué le {new Date(app.applied_at).toLocaleString('fr-FR')} par {app.applied_by_name || 'Utilisateur'}
                          </p>
                        </div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          -{parseFloat(app.amount_applied).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDetailsOpen(false)}
              className="text-xs"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
