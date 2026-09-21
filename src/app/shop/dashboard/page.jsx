// app/shop/dashboard/page.jsx
'use client';
import { useEffect, useState } from 'react';
import {
    ShoppingCart, DollarSign, TrendingUp, CreditCard, AlertTriangle,
    Users, Package, Receipt, ArrowUp, ArrowDown, Calendar, ChevronDown,
    RefreshCw,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import useShopDashboardStore, { DATE_PRESETS } from '@/store/shopDashboardStore';
import useCompanyStore from '@/store/companyStore';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ─── Formatage des dates pour l'affichage ─────────────────────────
const formatDisplayDate = (dateStr) => {
    try {
        return format(parseISO(dateStr), 'd MMM yyyy', { locale: fr });
    } catch {
        return dateStr;
    }
};

const getPeriodLabel = (activePreset, dateRange) => {
    if (activePreset !== 'custom') {
        return DATE_PRESETS[activePreset]?.label || 'Période';
    }
    if (!dateRange) return 'Période';
    return `${formatDisplayDate(dateRange.startDate)} → ${formatDisplayDate(dateRange.endDate)}`;
};

export default function ShopDashboard() {
    const {
        data, isLoading, fetchDashboard,
        activePreset, dateRange,
        setPreset, setCustomRange,
    } = useShopDashboardStore();
    const activeCompany = useCompanyStore((s) => s.activeCompany);

    // État local pour le sélecteur de date personnalisé
    const [customStart, setCustomStart] = useState(dateRange?.startDate || '');
    const [customEnd, setCustomEnd] = useState(dateRange?.endDate || '');
    const [showCustom, setShowCustom] = useState(false);

    useEffect(() => {
        if (activeCompany) fetchDashboard();
    }, [activeCompany]);

    // Synchroniser les inputs custom quand on change de preset
    useEffect(() => {
        if (dateRange) {
            setCustomStart(dateRange.startDate);
            setCustomEnd(dateRange.endDate);
        }
    }, [dateRange]);

    const handleApplyCustom = () => {
        if (customStart && customEnd && customStart <= customEnd) {
            setCustomRange(customStart, customEnd);
            setShowCustom(false);
        }
    };

    const handlePresetClick = (key) => {
        setPreset(key);
        setShowCustom(false);
    };

    const periodLabel = getPeriodLabel(activePreset, dateRange);
    const formatFCFA = (value) => `${Number(value).toLocaleString()} FCFA`;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-sm" style={{ color: p.color }}>
                            {p.name}: {p.name === 'count' || p.name === 'Nb ventes' ? p.value : formatFCFA(p.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading || !data) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                <p className="text-sm text-gray-400">Chargement des données…</p>
            </div>
        );
    }

    // ─── Données pour les charts ──────────────────────────────────
    const paymentData = (data.sales_by_payment || []).map(p => ({
        name: p.payment_method === 'cash' ? 'Espèces'
            : p.payment_method === 'mobile_money' ? 'Mobile Money'
                : p.payment_method === 'bank_transfer' ? 'Virement'
                    : p.payment_method,
        value: parseFloat(p.total),
        count: p.count,
    }));

    const salesChartData = (data.weekly_sales || []).map(d => ({
        date: new Date(d.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        revenue: parseFloat(d.revenue),
        count: Number(d.count),
    }));

    // ─── KPIs ─────────────────────────────────────────────────────
    const kpis = [
        {
            label: `Ventes (${periodLabel})`,
            value: data.summary?.total_sales || 0,
            sub: `Panier moy: ${Number(data.summary?.average_sale || 0).toLocaleString()} FCFA`,
            icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', trend: null,
        },
        {
            label: `Revenu net (${periodLabel})`,
            value: formatFCFA(data.summary?.total_revenue || 0),
            sub: `Clients uniques: ${data.summary?.unique_clients || 0}`,
            icon: DollarSign, color: 'bg-green-50 text-green-600', trend: null,
        },
        {
            label: `Retours (${periodLabel})`,
            value: formatFCFA(data.summary?.total_returned || 0),
            icon: TrendingUp, color: 'bg-purple-50 text-purple-600', trend: null,
        },
        {
            label: `Dépenses (${periodLabel})`,
            value: formatFCFA(data.expenses?.total_amount || 0),
            sub: `${data.expenses?.total_expenses || 0} opération(s)`,
            icon: Receipt, color: 'bg-amber-50 text-amber-600', trend: null,
        },
        {
            label: 'Dettes clients',
            value: formatFCFA(data.debts?.total_remaining || 0),
            sub: `${data.debts?.overdue_count || 0} en retard`,
            icon: CreditCard, color: 'bg-orange-50 text-orange-600', trend: 'down',
            badge: '⏱ Temps réel',
        },
        {
            label: 'Stock bas / Rupture',
            value: `${data.products?.low_stock || 0} / ${data.products?.out_of_stock || 0}`,
            sub: `${data.products?.total || 0} produits actifs`,
            icon: AlertTriangle, color: 'bg-red-50 text-red-600', trend: null,
            badge: '⏱ Temps réel',
        },
    ];

    const PRESET_KEYS = ['today', 'this_week', 'this_month', 'last_30', 'this_year'];

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

            {/* ── Header ── */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {activeCompany?.name} •{' '}
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                {/* Badge période active */}
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
                    <Calendar size={15} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">{periodLabel}</span>
                </div>
            </div>

            {/* ── Zone de filtres ── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Boutons presets */}
                    {PRESET_KEYS.map((key) => (
                        <button
                            key={key}
                            onClick={() => handlePresetClick(key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                                activePreset === key
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                            {DATE_PRESETS[key].label}
                        </button>
                    ))}

                    {/* Séparateur */}
                    <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />

                    {/* Bouton personnalisé */}
                    <button
                        onClick={() => setShowCustom(!showCustom)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                            activePreset === 'custom'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                    >
                        <Calendar size={14} />
                        Personnalisé
                        <ChevronDown size={14} className={`transition-transform ${showCustom ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Bouton rafraîchir */}
                    <button
                        onClick={() => fetchDashboard()}
                        disabled={isLoading}
                        className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
                        title="Actualiser"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Sélecteur de dates personnalisé */}
                {showCustom && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-end gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Date de début</label>
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                max={customEnd || undefined}
                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500">Date de fin</label>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                min={customStart || undefined}
                                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleApplyCustom}
                            disabled={!customStart || !customEnd || customStart > customEnd}
                            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Appliquer
                        </button>
                        <button
                            onClick={() => setShowCustom(false)}
                            className="px-4 py-2 text-gray-500 rounded-xl text-sm hover:bg-gray-50 border border-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                )}
            </div>

            {/* ── KPIs ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.color}`}>
                                <kpi.icon size={22} />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {kpi.badge && (
                                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                                        {kpi.badge}
                                    </span>
                                )}
                                {kpi.trend === 'down' && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                        <ArrowDown size={11} /> À surveiller
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">{kpi.label}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900">{kpi.value}</p>
                        {kpi.sub && <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>}
                    </div>
                ))}
            </div>

            {/* ── Charts Row 1 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart - Évolution des ventes */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-1">Évolution des ventes</h2>
                    <p className="text-xs text-gray-400 mb-5">Période : {periodLabel}</p>
                    {salesChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">Aucune vente sur cette période</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={salesChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="revenue" name="Revenu" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="count" name="Nb ventes" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart - Méthodes de paiement */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-1">Répartition des paiements</h2>
                    <p className="text-xs text-gray-400 mb-4">Période : {periodLabel}</p>
                    {paymentData.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">Aucune donnée</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={paymentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={82}
                                        paddingAngle={4}
                                        dataKey="value"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                    >
                                        {paymentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-3">
                                {paymentData.map((p, i) => (
                                    <div key={p.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                                            <span className="text-gray-600 truncate">{p.name}</span>
                                        </div>
                                        <span className="font-medium text-gray-800 ml-2">{formatFCFA(p.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Charts Row 2 ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart - Top Produits */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        Top 5 produits
                    </h2>
                    <p className="text-xs text-gray-400 mb-5">Période : {periodLabel}</p>
                    {!data.top_products || data.top_products.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">Aucune vente sur cette période</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={data.top_products.slice(0, 5).map(p => ({
                                    name: p.name.length > 15 ? p.name.substring(0, 15) + '…' : p.name,
                                    sold: parseFloat(p.total_sold),
                                    revenue: parseFloat(p.total_revenue),
                                }))}
                                layout="vertical"
                                margin={{ left: 10 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar dataKey="sold" name="Vendus" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top Clients */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <Users size={18} className="text-green-600" />
                        Meilleurs clients
                    </h2>
                    <p className="text-xs text-gray-400 mb-5">Période : {periodLabel}</p>
                    {!data.top_clients || data.top_clients.length === 0 ? (
                        <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">Aucune donnée sur cette période</div>
                    ) : (
                        <div className="space-y-3">
                            {data.top_clients.map((c, i) => {
                                const maxSpent = data.top_clients[0]?.total_spent || 1;
                                const pct = Math.min(100, (c.total_spent / maxSpent) * 100);
                                return (
                                    <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                                            : i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500'
                                            : i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500'
                                            : 'bg-gradient-to-br from-blue-400 to-blue-500'
                                        }`}>
                                            {c.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{c.full_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                    <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-400">{c.total_purchases} achat(s)</span>
                                            </div>
                                        </div>
                                        <p className="font-bold text-sm text-gray-800 flex-shrink-0">{formatFCFA(c.total_spent)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}