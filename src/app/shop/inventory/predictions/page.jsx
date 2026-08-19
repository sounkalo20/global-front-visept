// src/app/shop/inventory/predictions/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Package,
  ShoppingCart,
  ShieldAlert,
  Calendar,
  HelpCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
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
import useCompanyStore from '@/store/companyStore';
import api from '@/lib/axios';
import { toast } from 'sonner';

export default function StockPredictionsPage() {
  const { activeCompany } = useCompanyStore();
  const router = useRouter();

  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState({
    total_monitored_products: 0,
    out_of_stock_count: 0,
    critical_risk_count: 0,
    high_risk_count: 0,
    medium_risk_count: 0,
    low_risk_count: 0,
    urgent_actions_needed: 0,
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtres
  const [riskLevel, setRiskLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const companyId = activeCompany?.id;

  const fetchPredictions = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      let url = `/stock-predictions?company_id=${companyId}&days_window=30`;
      if (riskLevel !== 'all') url += `&risk_level=${riskLevel}`;
      if (selectedCategory !== 'all') url += `&category_id=${selectedCategory}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data?.success) {
        setPredictions(res.data.data.predictions || []);
        setSummary(res.data.data.summary || {});
      }
    } catch (error) {
      console.error('Erreur chargement prédictions:', error);
      toast.error('Impossible de calculer les prédictions de stock');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!companyId) return;
    try {
      const res = await api.get(`/categories?company_id=${companyId}`);
      if (res.data?.success) {
        const list = Array.isArray(res.data.data?.categories)
          ? res.data.data.categories
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setCategories(list);
      }
    } catch (e) {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchPredictions();
    fetchCategories();
  }, [companyId, riskLevel, selectedCategory]);

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-600 text-white shadow-2xs">
            <AlertCircle size={12} /> Rupture totale (0 stock)
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse">
            <AlertCircle size={12} /> Rupture imminente (&lt; 3j)
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <AlertTriangle size={12} /> Risque élevé (3 à 7j)
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-900">
            <Calendar size={12} /> Risque modéré (7 à 14j)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            Stock suffisant (&gt; 14j)
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence, reason) => {
    switch (confidence) {
      case 'high':
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-help"
            title={reason}
          >
            ● Fiabilité Élevée
          </span>
        );
      case 'moderate':
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 cursor-help"
            title={reason}
          >
            ▲ Fiabilité Modérée
          </span>
        );
      default:
        return (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 cursor-help"
            title={reason}
          >
            ? Données limitées
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            Prédictions de Rupture de Stock
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Estimation de l'épuisement des stocks calculée sur la base de la vélocité des ventes des 30 derniers jours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push('/shop/supplier-orders')}
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-semibold"
            title="Consulter les bons de commandes fournisseurs"
          >
            <ShoppingCart size={15} /> Commandes Fournisseurs
          </Button>

          <Button
            onClick={fetchPredictions}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-900"
            title="Recalculer les vélocités"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Cartes de synthèse des alertes de rupture */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Rupture totale */}
        <Card
          onClick={() => setRiskLevel(riskLevel === 'out_of_stock' ? 'all' : 'out_of_stock')}
          className={`cursor-pointer transition-all ${
            riskLevel === 'out_of_stock'
              ? 'ring-2 ring-red-500 bg-red-50/50 dark:bg-red-950/20'
              : 'bg-white dark:bg-gray-900 hover:border-red-300'
          } border-gray-200 dark:border-gray-800 shadow-2xs`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Ruptures Totales</span>
              <AlertCircle size={14} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {summary.out_of_stock_count}
            </p>
          </CardContent>
        </Card>

        {/* Rupture imminente < 3j */}
        <Card
          onClick={() => setRiskLevel(riskLevel === 'critical' ? 'all' : 'critical')}
          className={`cursor-pointer transition-all ${
            riskLevel === 'critical'
              ? 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
              : 'bg-white dark:bg-gray-900 hover:border-rose-300'
          } border-gray-200 dark:border-gray-800 shadow-2xs`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Critique (&lt; 3j)</span>
              <AlertTriangle size={14} className="text-rose-500" />
            </div>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {summary.critical_risk_count}
            </p>
          </CardContent>
        </Card>

        {/* Risque élevé 3-7j */}
        <Card
          onClick={() => setRiskLevel(riskLevel === 'high' ? 'all' : 'high')}
          className={`cursor-pointer transition-all ${
            riskLevel === 'high'
              ? 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
              : 'bg-white dark:bg-gray-900 hover:border-amber-300'
          } border-gray-200 dark:border-gray-800 shadow-2xs`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Élevé (3 à 7j)</span>
              <AlertTriangle size={14} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {summary.high_risk_count}
            </p>
          </CardContent>
        </Card>

        {/* Risque modéré 7-14j */}
        <Card
          onClick={() => setRiskLevel(riskLevel === 'medium' ? 'all' : 'medium')}
          className={`cursor-pointer transition-all ${
            riskLevel === 'medium'
              ? 'ring-2 ring-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'
              : 'bg-white dark:bg-gray-900 hover:border-yellow-300'
          } border-gray-200 dark:border-gray-800 shadow-2xs`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Modéré (7 à 14j)</span>
              <Calendar size={14} className="text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {summary.medium_risk_count}
            </p>
          </CardContent>
        </Card>

        {/* Total Sous Surveillance */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Suivis (30j)</span>
              <Package size={14} className="text-brand-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {summary.total_monitored_products}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Avertissement méthodologique */}
      <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
          <span className="font-semibold">Note méthodologique :</span> Les prédictions indiquées sont des <strong>estimations prévisionnelles</strong> calculées à partir des quantités réellement vendues au cours des 30 derniers jours. Si un produit a un historique de vente trop faible, un indicateur de fiabilité modérée est apposé pour éviter toute fausse interprétation.
        </div>
      </div>

      {/* Filtres et recherche */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger className="h-9 text-xs">
                  <Filter size={13} className="mr-1 text-gray-400" />
                  <SelectValue placeholder="Gravité du risque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux de risque</SelectItem>
                  <SelectItem value="out_of_stock">⛔ Ruptures totales</SelectItem>
                  <SelectItem value="critical">🔴 Critiques (&lt; 3j)</SelectItem>
                  <SelectItem value="high">🟠 Risque élevé (3 à 7j)</SelectItem>
                  <SelectItem value="medium">🟡 Risque modéré (7 à 14j)</SelectItem>
                  <SelectItem value="low_risk">🟢 Stock suffisant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {Array.isArray(categories) && categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher produit, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPredictions()}
              className="h-9 text-xs pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des prédictions */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">Produit & Catégorie</th>
                <th className="py-3 px-4 text-center">Stock actuel</th>
                <th className="py-3 px-4 text-center">Vélocité (30j)</th>
                <th className="py-3 px-4">Échéance estimée</th>
                <th className="py-3 px-4">Niveau de Risque</th>
                <th className="py-3 px-4">Réapprovisionnement suggéré</th>
                <th className="py-3 px-4">Fiabilité</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Calcul des vélocités et des projections d'épuisement...
                  </td>
                </tr>
              ) : predictions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 dark:text-gray-500">
                    Aucun produit ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                predictions.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors ${
                      p.prediction.risk_level === 'out_of_stock'
                        ? 'bg-red-50/20 dark:bg-red-950/10'
                        : p.prediction.risk_level === 'critical'
                        ? 'bg-rose-50/20 dark:bg-rose-950/10'
                        : ''
                    }`}
                  >
                    {/* Produit */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                            <Package size={16} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate max-w-xs" title={p.name}>
                            {p.name}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {p.sku || p.barcode || 'Sans code'} • {p.category_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Stock actuel */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`font-bold ${
                        p.current_stock <= 0
                          ? 'text-red-600'
                          : p.current_stock <= p.low_stock_threshold
                          ? 'text-rose-600'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {p.current_stock}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        Seuil: {p.low_stock_threshold}
                      </span>
                    </td>

                    {/* Vélocité */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {p.history.avg_daily_sales} u/jour
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {p.history.total_sold_in_window} vendus en 30j
                      </span>
                    </td>

                    {/* Échéance */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {p.prediction.days_remaining !== null ? (
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white">
                            ~ {p.prediction.days_remaining} jour{p.prediction.days_remaining > 1 ? 's' : ''}
                          </span>
                          {p.prediction.predicted_stockout_date && (
                            <span className="text-[10px] text-gray-400 block">
                              Épuisement : {new Date(p.prediction.predicted_stockout_date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Non calculable</span>
                      )}
                    </td>

                    {/* Risque */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getRiskBadge(p.prediction.risk_level)}
                    </td>

                    {/* Recommandation */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        +{p.prediction.recommended_reorder_qty} unités
                      </span>
                      {p.prediction.estimated_reorder_cost > 0 && (
                        <span className="text-[10px] text-gray-400 block">
                          ~ {p.prediction.estimated_reorder_cost.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </td>

                    {/* Fiabilité */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getConfidenceBadge(p.prediction.confidence_level, p.prediction.confidence_reason)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/shop/supplier-orders`)}
                        className="h-7 px-2.5 text-[11px] font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-2xs"
                        title="Initier un bon de commande fournisseur"
                      >
                        Commander <ArrowRight size={12} className="ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
