// app/super_admin/dashboard/page.jsx (REMPLACER)
'use client';
import { useEffect } from 'react';
import {
    Building2, Users, CreditCard, DollarSign, TrendingUp,
    Package, ShoppingCart, Clock, AlertTriangle, CheckCircle2,
    ArrowUp, ArrowDown, Star, Activity,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import useSuperAdminDashboardStore from '@/store/superAdmin/superAdminDashboardStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function SuperAdminDashboard() {
    const { data, isLoading, fetchDashboard } = useSuperAdminDashboardStore();

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (isLoading || !data) {
        return (
            <div className="flex justify-center py-32">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    const formatFCFA = (value) => `${Number(value || 0).toLocaleString()} FCFA`;
    const formatNumber = (value) => Number(value || 0).toLocaleString();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border rounded-xl shadow-lg p-3">
                    <p className="text-sm font-semibold mb-1">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-sm" style={{ color: p.color }}>
                            {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatFCFA(p.value) : p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Données charts
    const registrationsData = (data.registrations_by_month || []).map(d => ({
        month: d.month,
        total: d.total,
    }));

    const revenueData = (data.revenue_by_month || []).map(d => ({
        month: d.month,
        revenue: parseFloat(d.total),
    }));

    const companiesByTypeData = (data.companies_by_type || []).map(d => ({
        name: d.name,
        value: d.total,
    }));

    const companiesByPlanData = (data.companies_by_plan || []).map(d => ({
        name: d.name,
        value: d.total,
    }));

    const companiesByStatusData = (data.companies_by_status || []).map(d => ({
        name: d.subscription_status === 'active' ? 'Actif' : d.subscription_status === 'past_due' ? 'En retard' : d.subscription_status === 'canceled' ? 'Annulé' : d.subscription_status === 'expired' ? 'Expiré' : d.subscription_status,
        value: d.total,
        color: d.subscription_status === 'active' ? '#10b981' : d.subscription_status === 'past_due' ? '#f59e0b' : d.subscription_status === 'canceled' ? '#ef4444' : '#94a3b8',
    }));

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity size={26} className="text-brand-600" />
                        Tableau de bord administrateur
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {data.pending_payments_count > 0 && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                            <AlertTriangle size={16} className="text-red-500" />
                            <span className="text-sm font-medium text-red-700">
                                {data.pending_payments_count} paiement(s) en attente
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* KPIs Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Entreprises', value: formatNumber(data.total_companies), sub: `${data.active_companies} actives`, icon: Building2, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Utilisateurs', value: formatNumber(data.total_users), sub: `+${data.new_users_today} aujourd'hui`, icon: Users, color: 'bg-green-50 text-green-600' },
                    { label: 'Abonn. actifs', value: formatNumber(data.active_subscriptions), sub: `${data.expired_subscriptions} expirés`, icon: CheckCircle2, color: 'bg-purple-50 text-purple-600' },
                    { label: 'Revenu estimé/mois', value: formatFCFA(data.estimated_monthly_revenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
                    { label: 'Revenu réel/mois', value: formatFCFA(data.actual_revenue_this_month), icon: CreditCard, color: 'bg-amber-50 text-amber-600' },
                    { label: 'Produits', value: formatNumber(data.total_products), sub: `${formatNumber(data.total_sales)} ventes`, icon: Package, color: 'bg-rose-50 text-rose-600' },
                ].map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                                <kpi.icon size={18} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</p>
                        <p className="text-lg font-bold mt-0.5 text-gray-900">{kpi.value}</p>
                        {kpi.sub && <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>}
                    </div>
                ))}
            </div>

            {/* KPIs Row 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Nouvelles entreprises (mois)', value: data.new_companies_this_month, icon: TrendingUp, color: 'text-blue-600' },
                    { label: 'Nouvelles aujourd\'hui', value: data.new_companies_today, icon: Star, color: 'text-amber-500' },
                    { label: 'En période d\'essai', value: data.trial_companies, icon: Clock, color: 'text-purple-600' },
                    { label: 'Ventes du jour', value: formatFCFA(data.sales_today?.revenue), sub: `${data.sales_today?.total || 0} ventes`, icon: ShoppingCart, color: 'text-green-600' },
                ].map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                        <kpi.icon size={20} className={kpi.color} />
                        <div>
                            <p className="text-xs text-gray-500">{kpi.label}</p>
                            <p className="text-lg font-bold">{kpi.value}</p>
                            {kpi.sub && <p className="text-xs text-gray-400">{kpi.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inscriptions 12 mois */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        Inscriptions (12 mois)
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={registrationsData}>
                            <defs>
                                <linearGradient id="registrationsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="total" name="Inscriptions" stroke="#3b82f6" strokeWidth={3} fill="url(#registrationsGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenu 12 mois */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <DollarSign size={18} className="text-green-600" />
                        Revenu réel (12 mois)
                    </h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar dataKey="revenue" name="Revenu" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Par type */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Par type de business</h2>
                    {companiesByTypeData.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400">Aucune donnée</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={companiesByTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                                        {companiesByTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {companiesByTypeData.map((d, i) => (
                                    <div key={d.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                            <span className="text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="font-medium">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Par plan */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Par plan d'abonnement</h2>
                    {companiesByPlanData.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400">Aucune donnée</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={companiesByPlanData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
                                <RechartsTooltip />
                                <Bar dataKey="value" name="Entreprises" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Par statut */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Par statut d'abonnement</h2>
                    {companiesByStatusData.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400">Aucune donnée</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={companiesByStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                                        {companiesByStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {companiesByStatusData.map((d) => (
                                    <div key={d.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-gray-600">{d.name}</span>
                                        </div>
                                        <span className="font-medium">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 10 Companies */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Star size={18} className="text-amber-500" />
                        Top 10 entreprises (CA)
                    </h2>
                    {data.top_companies?.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">Aucune donnée</div>
                    ) : (
                        <div className="space-y-2">
                            {data.top_companies?.map((c, i) => (
                                <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{c.name}</p>
                                        <p className="text-xs text-gray-400">{c.city}{c.country ? `, ${c.country}` : ''} • {c.total_sales} ventes</p>
                                    </div>
                                    <p className="font-bold text-sm">{formatFCFA(c.total_revenue)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dernières inscriptions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-blue-600" />
                        Dernières inscriptions
                    </h2>
                    {data.latest_companies?.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">Aucune donnée</div>
                    ) : (
                        <div className="space-y-2">
                            {data.latest_companies?.map((c) => (
                                <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                        {c.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{c.name}</p>
                                        <p className="text-xs text-gray-400">{c.business_type_name} • {c.plan_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {c.subscription_status === 'active' ? 'Actif' : c.subscription_status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}