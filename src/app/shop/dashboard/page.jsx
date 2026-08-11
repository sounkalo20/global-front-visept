'use client';
import { useEffect, useState, useMemo } from 'react';
import {
    ShoppingCart, DollarSign, TrendingUp, CreditCard, AlertTriangle,
    Users, Receipt, ArrowUp, ArrowDown, Calendar, Package, ChevronDown
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import useShopDashboardStore from '@/store/shopDashboardStore';
import useCompanyStore from '@/store/companyStore';
import { format, subDays, startOfMonth, subMonths, startOfYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    ) : null;
};

export default function ShopDashboard() {
    const { data, isLoading, fetchDashboard, setDates, startDate, endDate } = useShopDashboardStore();
    const activeCompany = useCompanyStore((s) => s.activeCompany);
    const [periodStr, setPeriodStr] = useState('30d');

    useEffect(() => {
        if (activeCompany) {
            handlePeriodChange('30d');
        }
    }, [activeCompany]);

    const handlePeriodChange = (val) => {
        setPeriodStr(val);
        const today = new Date();
        let start = new Date();
        let end = new Date();
        end.setHours(23, 59, 59, 999);

        switch (val) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                start = subDays(today, 1);
                start.setHours(0, 0, 0, 0);
                end = subDays(today, 1);
                end.setHours(23, 59, 59, 999);
                break;
            case '7d':
                start = subDays(today, 6);
                start.setHours(0, 0, 0, 0);
                break;
            case '30d':
                start = subDays(today, 29);
                start.setHours(0, 0, 0, 0);
                break;
            case 'this_month':
                start = startOfMonth(today);
                break;
            case 'last_month':
                start = startOfMonth(subMonths(today, 1));
                end = subDays(startOfMonth(today), 1);
                end.setHours(23, 59, 59, 999);
                break;
            case 'this_year':
                start = startOfYear(today);
                break;
            default:
                break;
        }

        const startIso = start.toISOString().split('T')[0];
        const endIso = end.toISOString().split('T')[0];
        fetchDashboard(startIso, endIso);
    };

    if (isLoading || !data) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                    <p className="text-gray-500 font-medium">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    const formatFCFA = (value) => `${Number(value).toLocaleString()} F`;
    const formatFCFAFull = (value) => `${Number(value).toLocaleString()} FCFA`;

    const summary = data.summary || {};
    const evolutionData = (data.evolution || []).map(d => ({
        ...d,
        dateFormatted: format(new Date(d.date), 'dd MMM', { locale: fr })
    }));

    const hourlyData = (data.hourly_sales || []).map(d => ({
        hour: `${d.hour}h`,
        revenue: parseFloat(d.revenue),
        count: d.count
    }));

    const categoryData = (data.sales_by_category || []).map(d => ({
        name: d.category_name || 'Sans Catégorie',
        value: parseFloat(d.total_revenue)
    }));

    const paymentData = (data.sales_by_payment || []).map(p => ({
        name: p.payment_method === 'cash' ? 'Espèces' : p.payment_method === 'mobile_money' ? 'Mobile Money' : p.payment_method === 'bank_transfer' ? 'Virement' : p.payment_method,
        value: parseFloat(p.total),
    }));

    const TrendBadge = ({ value }) => {
        if (value === 0) return <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">--</span>;
        if (value > 0) return <span className="flex items-center text-[11px] font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full"><ArrowUp size={10} className="mr-0.5"/>+{value}%</span>;
        return <span className="flex items-center text-[11px] font-medium text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full"><ArrowDown size={10} className="mr-0.5"/>{value}%</span>;
    };

    const kpis = [
        { label: 'Revenu Net', value: formatFCFAFull(summary.total_revenue), sub: `Retours: ${formatFCFAFull(summary.total_returned)}`, trend: summary.revenue_trend, icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
        { label: 'Marge Brute', value: formatFCFAFull(summary.gross_margin), sub: `Taux: ${summary.total_revenue > 0 ? Math.round((summary.gross_margin / summary.total_revenue) * 100) : 0}%`, trend: summary.margin_trend, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
        { label: 'Ventes', value: summary.total_sales, sub: `Panier moy: ${formatFCFAFull(summary.average_sale)}`, trend: summary.sales_trend, icon: ShoppingCart, color: 'bg-purple-50 text-purple-600' },
        { label: 'Dettes Clients', value: formatFCFAFull(data.debts?.total_remaining || 0), sub: `${data.debts?.overdue_count || 0} en retard`, icon: CreditCard, color: 'bg-orange-50 text-orange-600' },
        { label: 'Dépenses Période', value: formatFCFAFull(data.expenses?.total_amount || 0), sub: `${data.expenses?.total_expenses || 0} dépense(s)`, icon: Receipt, color: 'bg-red-50 text-red-600' },
        { label: 'Alertes Stock', value: `${data.products?.low_stock || 0}`, sub: `${data.products?.out_of_stock || 0} en rupture`, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl p-3">
                    <p className="text-sm font-bold text-gray-800 mb-1">{label}</p>
                    {payload.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-4 text-sm mb-1">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="text-gray-600">{p.name}</span>
                            </div>
                            <span className="font-semibold text-gray-900">
                                {p.name.toLowerCase().includes('count') || p.name.toLowerCase().includes('ventes') ? p.value : formatFCFA(p.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header & Date Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tableau de bord</h1>
                    <p className="text-gray-500 text-sm mt-1">{activeCompany?.name} • Aperçu des performances</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border">
                    <Calendar size={18} className="text-gray-500 ml-2" />
                    <Select value={periodStr} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[180px] border-0 bg-transparent shadow-none focus:ring-0 font-medium">
                            <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Aujourd'hui</SelectItem>
                            <SelectItem value="yesterday">Hier</SelectItem>
                            <SelectItem value="7d">7 derniers jours</SelectItem>
                            <SelectItem value="30d">30 derniers jours</SelectItem>
                            <SelectItem value="this_month">Ce mois</SelectItem>
                            <SelectItem value="last_month">Mois dernier</SelectItem>
                            <SelectItem value="this_year">Cette année</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${kpi.color}`}>
                                <kpi.icon size={20} />
                            </div>
                            {kpi.trend !== undefined && kpi.trend !== null && <TrendBadge value={kpi.trend} />}
                        </div>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{kpi.label}</p>
                        <p className="text-xl font-extrabold mt-1 text-gray-900 truncate">{kpi.value}</p>
                        {kpi.sub && <p className="text-[11px] text-gray-400 mt-1 font-medium">{kpi.sub}</p>}
                    </div>
                ))}
            </div>

            {/* Charts Row 1: Evolution & Hourly */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Evolution Area Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp size={18} className="text-brand-600" />
                            Évolution Chiffre d'affaires vs Marge
                        </h2>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="dateFormatted" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Chiffre d'affaires" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            <Area type="monotone" dataKey="margin" name="Marge brute" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMargin)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Hourly Sales */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Users size={18} className="text-orange-500" />
                        Heures d'affluence
                    </h2>
                    {hourlyData.length === 0 ? (
                        <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm bg-gray-50 rounded-xl">Aucune donnée</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="revenue" name="Revenu" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Charts Row 2: Categories, Top Products, Top Clients */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Categories */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={18} className="text-purple-500" />
                        Ventes par catégorie
                    </h2>
                    {categoryData.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm bg-gray-50 rounded-xl">Aucune donnée</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-2 mt-2 max-h-[80px] overflow-y-auto pr-2 custom-scrollbar">
                                {categoryData.map((c, i) => (
                                    <div key={c.name} className="flex items-center gap-2 text-[11px] bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-gray-700 truncate font-medium">{c.name}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ShoppingCart size={18} className="text-blue-500" />
                        Top 5 Produits
                    </h2>
                    {data.top_products?.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm bg-gray-50 rounded-xl">Aucune donnée</div>
                    ) : (
                        <div className="space-y-3">
                            {data.top_products?.map((p, i) => (
                                <div key={p.id} className="flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-gray-900 truncate">{p.name}</p>
                                        <p className="text-[11px] text-gray-500">{p.total_sold} vendus</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-gray-900">{formatFCFA(p.total_revenue)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Clients */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users size={18} className="text-teal-500" />
                        Meilleurs Clients
                    </h2>
                    {data.top_clients?.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm bg-gray-50 rounded-xl">Aucune donnée</div>
                    ) : (
                        <div className="space-y-3">
                            {data.top_clients?.map((c, i) => (
                                <div key={c.id} className="flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                        {c.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-gray-900 truncate">{c.full_name}</p>
                                        <p className="text-[11px] text-gray-500">{c.total_purchases} achat(s)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-gray-900">{formatFCFA(c.total_spent)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}