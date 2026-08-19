// src/app/shop/journal/page.jsx
'use client';
import { useState, useEffect } from 'react';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  RefreshCw,
  Search,
  CheckCircle2,
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

export default function JournalPage() {
  const { activeCompany } = useCompanyStore();

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({
    total_credit: 0,
    total_debit: 0,
    net_balance: 0,
    total_operations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filtres
  const [period, setPeriod] = useState('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const companyId = activeCompany?.id;

  const fetchJournal = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      let url = `/journal?company_id=${companyId}&period=${period}&type=${typeFilter}`;
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await api.get(url);
      if (res.data?.success) {
        setEntries(res.data.data.entries || []);
        setSummary(res.data.data.summary || {});
      }
    } catch (error) {
      console.error('Erreur chargement journal:', error);
      toast.error('Impossible de charger le journal des opérations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, [companyId, period, startDate, endDate, typeFilter]);

  const handleExportCsv = async () => {
    if (!companyId) return;
    try {
      let url = `/journal/export?company_id=${companyId}&period=${period}&type=${typeFilter}`;
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `journal_operations_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Journal exporté avec succès en CSV');
    } catch (error) {
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  // Filtrer par recherche textuelle
  const filteredEntries = entries.filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (e.reference && e.reference.toLowerCase().includes(s)) ||
      (e.description && e.description.toLowerCase().includes(s)) ||
      (e.user_name && e.user_name.toLowerCase().includes(s)) ||
      (e.payment_method && e.payment_method.toLowerCase().includes(s))
    );
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'sale_payment':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <ArrowDownRight size={12} /> Vente directe
          </span>
        );
      case 'debt_collection':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
            <CheckCircle2 size={12} /> Règlement dette
          </span>
        );
      case 'expense':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <ArrowUpRight size={12} /> Dépense
          </span>
        );
      case 'supplier_payment':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <ArrowUpRight size={12} /> Fournisseur
          </span>
        );
      case 'sale_return':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            <ArrowUpRight size={12} /> Remboursement
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {type}
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
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileText size={22} />
            </div>
            Journal des Opérations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Traçabilité chronologique complète de tous les flux financiers (entrées et sorties) sans doublon.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleExportCsv}
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-semibold border-gray-200 dark:border-gray-700"
            title="Télécharger l'extrait du journal au format tableur CSV"
          >
            <Download size={15} /> Exporter CSV
          </Button>

          <Button
            onClick={fetchJournal}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-900"
            title="Actualiser les écritures comptables"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Cartes de synthèse financière */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entrées */}
        <Card className="bg-white dark:bg-gray-900 border-emerald-100 dark:border-emerald-950/60 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                Entrées (Crédit)
                <span title="Total des ventes perçues et recouvrements de dettes">
                  <HelpCircle size={13} className="text-gray-400 cursor-help" />
                </span>
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              +{parseFloat(summary.total_credit || 0).toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>

        {/* Total Sorties */}
        <Card className="bg-white dark:bg-gray-900 border-rose-100 dark:border-rose-950/60 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                Sorties (Débit)
                <span title="Total des dépenses, paiements fournisseurs et remboursements">
                  <HelpCircle size={13} className="text-gray-400 cursor-help" />
                </span>
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <TrendingDown size={16} />
              </div>
            </div>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-2">
              -{parseFloat(summary.total_debit || 0).toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>

        {/* Solde Net */}
        <Card className="bg-white dark:bg-gray-900 border-brand-100 dark:border-brand-950/60 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                Flux Net de Période
                <span title="Différence directe : Entrées - Sorties réelles sur la période sélectionnée">
                  <HelpCircle size={13} className="text-gray-400 cursor-help" />
                </span>
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <p className={`text-xl font-bold mt-2 ${
              (summary.net_balance || 0) >= 0
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {(summary.net_balance || 0) >= 0 ? '+' : ''}
              {parseFloat(summary.net_balance || 0).toLocaleString('fr-FR')} FCFA
            </p>
          </CardContent>
        </Card>

        {/* Total Écritures */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Opérations traitées
              </span>
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <FileText size={16} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
              {summary.total_operations || 0} écriture{summary.total_operations > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de filtres et recherche */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Période */}
            <div className="w-44">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="h-9 text-xs">
                  <Calendar size={13} className="mr-1 text-gray-400" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="yesterday">Hier</SelectItem>
                  <SelectItem value="this_week">Cette semaine</SelectItem>
                  <SelectItem value="last_week">Semaine dernière</SelectItem>
                  <SelectItem value="this_month">Ce mois-ci</SelectItem>
                  <SelectItem value="last_month">Mois dernier</SelectItem>
                  <SelectItem value="this_year">Cette année</SelectItem>
                  <SelectItem value="custom">📅 Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-xs w-36"
                />
                <span className="text-gray-400 text-xs">au</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-xs w-36"
                />
              </div>
            )}

            {/* Type d'opération */}
            <div className="w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <Filter size={13} className="mr-1 text-gray-400" />
                  <SelectValue placeholder="Type de flux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types de flux</SelectItem>
                  <SelectItem value="sale_payment">🟢 Ventes encaissées</SelectItem>
                  <SelectItem value="debt_collection">🔵 Règlements dettes</SelectItem>
                  <SelectItem value="expense">🔴 Dépenses d'exploitation</SelectItem>
                  <SelectItem value="supplier_payment">🟠 Paiements fournisseurs</SelectItem>
                  <SelectItem value="sale_return">🟣 Remboursements retours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recherche */}
          <div className="w-full sm:w-64 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher référence, note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau du Journal */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Description / Tiers</th>
                <th className="py-3 px-4">Moyen</th>
                <th className="py-3 px-4 text-right">Crédit (Entrée)</th>
                <th className="py-3 px-4 text-right">Débit (Sortie)</th>
                <th className="py-3 px-4 text-right">Solde progressif</th>
                <th className="py-3 px-4">Auteur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-500">
                    <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Chargement du journal des opérations...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400 dark:text-gray-500">
                    Aucune écriture enregistrée sur cette période.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e, idx) => (
                  <tr
                    key={`${e.type}-${e.source_id || idx}-${idx}`}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {new Date(e.operation_date).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getTypeBadge(e.type)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {e.reference || '-'}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-gray-800 dark:text-gray-300" title={e.description}>
                      {e.description}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500 dark:text-gray-400 uppercase text-[11px]">
                      {e.payment_method || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {e.credit > 0 ? `+${e.credit.toLocaleString('fr-FR')} FCFA` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      {e.debit > 0 ? `-${e.debit.toLocaleString('fr-FR')} FCFA` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white whitespace-nowrap bg-gray-50/40 dark:bg-gray-800/20">
                      {e.running_balance.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-[11px]">
                      {e.user_name || '-'}
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
