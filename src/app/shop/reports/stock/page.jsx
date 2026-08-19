// src/app/shop/reports/stock/page.jsx
'use client';
import { useState, useEffect } from 'react';
import {
  ClipboardList,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  HelpCircle,
  RefreshCw,
  Search,
  AlertTriangle,
  RotateCw,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import useCompanyStore from '@/store/companyStore';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function StockReportsPage() {
  const { activeCompany } = useCompanyStore();

  const [activeTab, setActiveTab] = useState('valuation');
  const [isLoading, setIsLoading] = useState(true);

  // Tab 1 : Valeur du stock
  const [valuationData, setValuationData] = useState({
    summary: {},
    categories: [],
    top_products: [],
  });

  // Tab 2 : Mouvements
  const [movementsData, setMovementsData] = useState({
    summary: {},
    movements: [],
    pagination: {},
  });
  const [movementType, setMovementType] = useState('all');
  const [movementsPage, setMovementsPage] = useState(1);

  // Tab 3 : Rotation
  const [rotationData, setRotationData] = useState({
    summary: {},
    fast_movers: [],
    slow_movers: [],
    dead_stock: [],
  });
  const [rotationDays, setRotationDays] = useState('30');

  const companyId = activeCompany?.id;

  const fetchValuation = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/reports/stock-valuation?company_id=${companyId}`);
      if (res.data?.success) {
        setValuationData({
          summary: res.data.data?.summary || {},
          categories: res.data.data?.categories || [],
          top_products: res.data.data?.top_products || [],
        });
      }
    } catch (error) {
      console.error('Erreur valorisation stock:', error);
      toast.error('Impossible de charger la valorisation du stock');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovements = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      let url = `/reports/stock-movements?company_id=${companyId}&page=${movementsPage}&limit=25`;
      if (movementType !== 'all') url += `&movement_type=${movementType}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setMovementsData({
          summary: res.data.data?.summary || {},
          movements: res.data.data?.movements || [],
          pagination: res.data.data?.pagination || {},
        });
      }
    } catch (error) {
      console.error('Erreur mouvements stock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRotation = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/reports/stock-rotation?company_id=${companyId}&days=${rotationDays}`);
      if (res.data?.success) {
        setRotationData({
          summary: res.data.data?.summary || {},
          fast_movers: res.data.data?.fast_movers || [],
          slow_movers: res.data.data?.slow_movers || [],
          dead_stock: res.data.data?.dead_stock || [],
        });
      }
    } catch (error) {
      console.error('Erreur rotation stock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'valuation') fetchValuation();
    else if (activeTab === 'movements') fetchMovements();
    else if (activeTab === 'rotation') fetchRotation();
  }, [companyId, activeTab, movementType, movementsPage, rotationDays]);

  const handleExportValuationCsv = async () => {
    if (!companyId) return;
    try {
      const response = await api.get(`/reports/stock-valuation/export?company_id=${companyId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `valorisation_stock_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Rapport de valorisation exporté en CSV');
    } catch (error) {
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  const vSummary = valuationData.summary || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ClipboardList size={22} />
            </div>
            Rapports & Valeur du Stock
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analyse détaillée de la valorisation de votre stock, historique des flux et rotation des articles.
          </p>
        </div>

        {activeTab === 'valuation' && (
          <Button
            onClick={handleExportValuationCsv}
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-semibold"
            title="Exporter l'inventaire valorisé en CSV"
          >
            <Download size={15} /> Exporter Valorisation CSV
          </Button>
        )}
      </div>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl">
          <TabsTrigger value="valuation" className="text-xs font-semibold rounded-lg gap-2">
            <DollarSign size={14} /> Valeur & Catégories
          </TabsTrigger>
          <TabsTrigger value="movements" className="text-xs font-semibold rounded-lg gap-2">
            <Layers size={14} /> Mouvements & Flux
          </TabsTrigger>
          <TabsTrigger value="rotation" className="text-xs font-semibold rounded-lg gap-2">
            <RotateCw size={14} /> Rotation & Stock Dormant
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1 : VALORISATION DU STOCK ─────────────────────────── */}
        <TabsContent value="valuation" className="space-y-6">
          {/* Métriques globales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Valeur Coût d'Achat */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    Valeur d'Achat Stock
                    <span title="Somme des (Stock actuel × Prix d'achat unitaire)">
                      <HelpCircle size={13} className="text-gray-400 cursor-help" />
                    </span>
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <DollarSign size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {parseFloat(vSummary.total_cost_value || 0).toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Capital immobilisé en marchandises
                </p>
              </CardContent>
            </Card>

            {/* Valeur Revente Potentielle */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    Valeur Marchande (Vente)
                    <span title="Chiffre d'affaires potentiel si tout le stock est vendu au prix de détail">
                      <HelpCircle size={13} className="text-gray-400 cursor-help" />
                    </span>
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {parseFloat(vSummary.total_retail_value || 0).toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Valeur totale au prix public
                </p>
              </CardContent>
            </Card>

            {/* Marge Brute Potentielle */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    Marge Potentielle
                    <span title="Marge brute globale réalisable sur l'écoulement du stock">
                      <HelpCircle size={13} className="text-gray-400 cursor-help" />
                    </span>
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {parseFloat(vSummary.potential_gross_margin || 0).toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-[11px] text-purple-600/80 font-medium mt-1">
                  Taux de marge estimé : {vSummary.margin_rate || 0}%
                </p>
              </CardContent>
            </Card>

            {/* Volume d'articles */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Volume en Stock
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Package size={16} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {parseFloat(vSummary.total_units_in_stock || 0).toLocaleString('fr-FR')} unités
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {vSummary.in_stock_products || 0} références en stock
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tableau de valorisation par Catégorie */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">
                Valorisation et Répartition par Catégorie
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4 text-center">Références</th>
                    <th className="py-3 px-4 text-center">Unités en stock</th>
                    <th className="py-3 px-4 text-right">Valeur d'Achat</th>
                    <th className="py-3 px-4 text-right">Valeur de Vente</th>
                    <th className="py-3 px-4 text-right">Marge Réalisable</th>
                    <th className="py-3 px-4 text-center">Part du Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {valuationData.categories.map((cat) => (
                    <tr key={cat.category_id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                        {cat.category_name}
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-600 dark:text-gray-400">
                        {cat.product_count}
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-900 dark:text-white font-semibold">
                        {cat.total_units}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-900 dark:text-white font-bold">
                        {cat.cost_value.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                        {cat.retail_value.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3.5 px-4 text-right text-purple-600 dark:text-purple-400 font-semibold">
                        +{cat.category_margin.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, cat.percentage_of_total_value)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                            {cat.percentage_of_total_value}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ─── TAB 2 : MOUVEMENTS DE STOCK ──────────────────────────── */}
        <TabsContent value="movements" className="space-y-6">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-56">
                  <Select value={movementType} onValueChange={setMovementType}>
                    <SelectTrigger className="h-9 text-xs">
                      <Filter size={13} className="mr-1 text-gray-400" />
                      <SelectValue placeholder="Type de mouvement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types de mouvements</SelectItem>
                      <SelectItem value="sale">🔴 Sorties Vente</SelectItem>
                      <SelectItem value="purchase">🟢 Entrées Achat Fournisseur</SelectItem>
                      <SelectItem value="adjustment">🟡 Ajustements Inventaire</SelectItem>
                      <SelectItem value="return_customer">🟣 Retours Clients</SelectItem>
                      <SelectItem value="loss">⚫ Pertes / Avaries</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Produit</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-center">Quantité</th>
                    <th className="py-3 px-4 text-center">Avant / Après</th>
                    <th className="py-3 px-4">Motif / Justification</th>
                    <th className="py-3 px-4">Auteur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {movementsData.movements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-gray-400">
                        Aucun mouvement enregistré avec ces critères.
                      </td>
                    </tr>
                  ) : (
                    movementsData.movements.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                        <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {new Date(m.created_at).toLocaleString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          {m.product_name}
                          <span className="text-[10px] text-gray-400 block">{m.category_name}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            m.movement_type === 'sale'
                              ? 'bg-rose-50 text-rose-700'
                              : m.movement_type === 'purchase'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {m.movement_type}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-center font-bold ${
                          m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500 font-mono text-[11px]">
                          {m.stock_before} → {m.stock_after}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate" title={m.note}>
                          {m.note || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                          {m.performed_by_name || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ─── TAB 3 : ROTATION & STOCK DORMANT ──────────────────────── */}
        <TabsContent value="rotation" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500">Période d'analyse de rotation :</span>
              <div className="w-36">
                <Select value={rotationDays} onValueChange={setRotationDays}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="60">60 jours</SelectItem>
                    <SelectItem value="90">90 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {rotationData.summary?.dead_stock_value > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-900">
                <AlertTriangle size={14} /> Capital dormant :{' '}
                {parseFloat(rotationData.summary.dead_stock_value).toLocaleString('fr-FR')} FCFA
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Dormant (0 vente) */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 bg-rose-50/40 dark:bg-rose-950/20">
                <CardTitle className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center justify-between">
                  <span>Stock Dormant (0 vente en {rotationDays}j)</span>
                  <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                    {rotationData.dead_stock?.length || 0} références
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {rotationData.dead_stock?.length === 0 ? (
                  <p className="p-6 text-center text-xs text-gray-400">Aucun produit dormant. Excellent !</p>
                ) : (
                  rotationData.dead_stock?.map((p) => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.category_name} • Stock: {p.current_stock} u</p>
                      </div>
                      <span className="font-bold text-rose-600">
                        {parseFloat(p.stock_value || 0).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Forte Rotation */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 bg-emerald-50/40 dark:bg-emerald-950/20">
                <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                  <span>Articles à Forte Rotation (Best-sellers)</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {rotationData.fast_movers?.length || 0} références
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {rotationData.fast_movers?.length === 0 ? (
                  <p className="p-6 text-center text-xs text-gray-400">Aucune donnée de rotation forte.</p>
                ) : (
                  rotationData.fast_movers?.map((p) => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-[11px] text-emerald-600 font-medium">
                          {p.total_sold_qty} vendus (~{p.daily_velocity} u/jour)
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Stock : {p.current_stock} u
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
