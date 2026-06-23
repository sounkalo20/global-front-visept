// app/restaurant/dashboard/page.jsx (REMPLACER)
'use client';
import { useEffect } from 'react';
import {
    ShoppingCart, DollarSign, TrendingUp, CreditCard, Utensils,
    Users, Receipt, Clock, Star, Coffee, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import useRestaurantDashboardStore from '@/store/restaurantDashboardStore';
import useCompanyStore from '@/store/companyStore';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

export default function RestaurantDashboard() {
    const { data, isLoading, fetchDashboard } = useRestaurantDashboardStore();
    const activeCompany = useCompanyStore((s) => s.activeCompany);

    useEffect(() => {
        if (activeCompany) fetchDashboard();
    }, [activeCompany]);

    if (isLoading || !data) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
            </div>
        );
    }

    const formatFCFA = (value) => `${Number(value).toLocaleString()} FCFA`;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border rounded-xl shadow-lg p-3">
                    <p className="text-sm font-semibold">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-sm" style={{ color: p.color }}>
                            {p.name}: {p.name === 'count' || p.name === 'Commandes' ? p.value : formatFCFA(p.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Données charts
    const weeklyData = (data.weekly_sales || []).map(d => ({
        date: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        revenue: parseFloat(d.revenue),
        count: d.count,
    }));

    const hourlyData = (data.sales_by_hour || []).map(h => ({
        hour: `${String(h.hour).padStart(2, '0')}h`,
        count: h.count,
        revenue: parseFloat(h.revenue),
    }));

    const paymentData = (data.sales_by_payment || []).map(p => ({
        name: p.payment_method === 'cash' ? 'Espèces' : p.payment_method === 'mobile_money' ? 'Mobile Money' : p.payment_method === 'bank_transfer' ? 'Virement' : p.payment_method,
        value: parseFloat(p.total),
    }));

    const kpis = [
        { label: 'Commandes du jour', value: data.today?.total_orders || 0, sub: `Panier moyen: ${Number(data.today?.average_order || 0).toLocaleString()} FCFA`, icon: Coffee, color: 'bg-orange-50 text-orange-600', trend: null },
        { label: 'Revenu du jour', value: formatFCFA(data.today?.total_revenue || 0), icon: DollarSign, color: 'bg-green-50 text-green-600', trend: 'up' },
        { label: 'Revenu du mois', value: formatFCFA(data.this_month?.total_revenue || 0), sub: `${data.this_month?.total_orders || 0} commandes`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', trend: 'up' },
        { label: 'Dettes clients', value: formatFCFA(data.debts?.total_remaining || 0), sub: `${data.debts?.overdue_count || 0} en retard`, icon: CreditCard, color: 'bg-red-50 text-red-600', trend: 'down' },
        { label: 'Dépenses du mois', value: formatFCFA(data.expenses?.total_amount || 0), icon: Receipt, color: 'bg-amber-50 text-amber-600', trend: null },
        { label: 'Plats disponibles', value: `${data.dishes?.available || 0}/${data.dishes?.total || 0}`, sub: `${data.dishes?.unavailable || 0} indisponibles`, icon: Utensils, color: 'bg-blue-50 text-blue-600', trend: null },
    ];

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Utensils size={26} className="text-orange-600" />
                        Dashboard Restaurant
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">{activeCompany?.name} • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.color}`}>
                                <kpi.icon size={22} />
                            </div>
                            {kpi.trend === 'up' && <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full"><ArrowUp size={12} />+12%</span>}
                            {kpi.trend === 'down' && <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full"><ArrowDown size={12} />À surveiller</span>}
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{kpi.label}</p>
                        <p className="text-2xl font-bold mt-1 text-gray-900">{kpi.value}</p>
                        {kpi.sub && <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>}
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart - Ventes 7 jours */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6">Évolution des ventes (7 jours)</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Revenu" stroke="#f97316" strokeWidth={3} fill="url(#revenueGradient)" />
                            <Line type="monotone" dataKey="count" name="Commandes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart - Paiements */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Paiements du mois</h2>
                    {paymentData.length === 0 ? (
                        <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">Aucune donnée</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {paymentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {paymentData.map((p, i) => (
                                    <div key={p.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                            <span className="text-gray-600">{p.name}</span>
                                        </div>
                                        <span className="font-medium">{formatFCFA(p.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commandes par heure */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-blue-600" />
                        Commandes par heure (aujourd'hui)
                    </h2>
                    {hourlyData.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">Aucune commande aujourd'hui</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Commandes" fill="#f97316" radius={[6, 6, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top Plats */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-orange-600" />
                        Top 5 plats (30j)
                    </h2>
                    {data.top_dishes?.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">Aucune vente</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.top_dishes?.slice(0, 5).map(d => ({ name: d.name.length > 18 ? d.name.substring(0, 18) + '...' : d.name, sold: parseFloat(d.total_sold), revenue: parseFloat(d.total_revenue) }))} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={130} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar dataKey="sold" name="Vendus" fill="#f97316" radius={[0, 6, 6, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top Clients */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Users size={18} className="text-green-600" />
                    Meilleurs clients (30j)
                </h2>
                {data.top_clients?.length === 0 ? (
                    <div className="flex items-center justify-center h-[120px] text-gray-400 text-sm">Aucune donnée</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.top_clients?.map((c, i) => (
                            <div key={c.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                                    {c.full_name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{c.full_name}</p>
                                    <p className="text-xs text-gray-400">{c.total_visits} visite(s) • {formatFCFA(c.total_spent)}</p>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}