// app/shop/dashboard/page.jsx (REMPLACER)
'use client';
import { useEffect } from 'react';
import {
    ShoppingCart, DollarSign, TrendingUp, CreditCard, AlertTriangle,
    Users, Package, Truck, Receipt, Star, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import useShopDashboardStore from '@/store/shopDashboardStore';
import useCompanyStore from '@/store/companyStore';
import { useRouter } from 'next/navigation';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const RADIAN = Math.PI / 180;

// Custom label pour le Pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function ShopDashboard() {
    const { data, isLoading, fetchDashboard } = useShopDashboardStore();
    const activeCompany = useCompanyStore((s) => s.activeCompany);
    const router = useRouter();

    useEffect(() => {
        if (activeCompany) {
            if (activeCompany.my_role === 'cashier') {
                router.replace('/shop/sales');
            } else {
                fetchDashboard();
            }
        }
    }, [activeCompany, router]);

    if (isLoading || !data) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    // Données pour le Pie chart (méthodes de paiement)
    const paymentData = (data.sales_by_payment || []).map(p => ({
        name: p.payment_method === 'cash' ? 'Espèces' : p.payment_method === 'mobile_money' ? 'Mobile Money' : p.payment_method === 'bank_transfer' ? 'Virement' : p.payment_method,
        value: parseFloat(p.total),
        count: p.count,
    }));

    // Données pour le Line chart (ventes 7 jours)
    const weeklyData = (data.weekly_sales || []).map(d => ({
        date: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        revenue: parseFloat(d.revenue),
        count: d.count,
    }));

    const formatFCFA = (value) => `${Number(value).toLocaleString()} FCFA`;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border rounded-xl shadow-lg p-3">
                    <p className="text-sm font-semibold">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-sm" style={{ color: p.color }}>
                            {p.name}: {p.name === 'count' ? p.value : formatFCFA(p.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const kpis = [
        { label: 'Ventes du jour', value: data.today?.total_sales || 0, sub: `Panier moyen: ${Number(data.today?.average_sale || 0).toLocaleString()} FCFA`, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', trend: null },
        { label: 'Revenu net du jour', value: formatFCFA(data.today?.total_revenue || 0), sub: `Retours: ${formatFCFA(data.today?.total_returned || 0)}`, icon: DollarSign, color: 'bg-green-50 text-green-600', trend: null },
        { label: 'Revenu net du mois', value: formatFCFA(data.this_month?.total_revenue || 0), sub: `${data.this_month?.total_sales || 0} ventes`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600', trend: 'up' },
        { label: 'Total Retours (mois)', value: formatFCFA(data.this_month?.total_returned || 0), icon: DollarSign, color: 'bg-red-50 text-red-600', trend: null },
        { label: 'Dettes clients', value: formatFCFA(data.debts?.total_remaining || 0), sub: `${data.debts?.overdue_count || 0} en retard`, icon: CreditCard, color: 'bg-orange-50 text-orange-600', trend: 'down' },
        { label: 'Dépenses du mois', value: formatFCFA(data.expenses?.total_amount || 0), icon: Receipt, color: 'bg-orange-50 text-orange-600', trend: null },
        { label: 'Stock bas / Rupture', value: `${data.products?.low_stock || 0} / ${data.products?.out_of_stock || 0}`, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600', trend: null },
    ];

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
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
                {/* Line Chart - Ventes 7 jours */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6">Évolution des ventes (7 jours)</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="revenue" name="Revenu" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} activeDot={{ r: 7 }} />
                            <Line type="monotone" dataKey="count" name="Nb ventes" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart - Méthodes de paiement */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Paiements du mois</h2>
                    {paymentData.length === 0 ? (
                        <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">Aucune donnée</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
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
                {/* Bar Chart - Top Produits */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-brand-600" />
                        Top 5 produits (30j)
                    </h2>
                    {data.top_products?.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">Aucune vente</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.top_products?.slice(0, 5).map(p => ({ name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name, sold: parseFloat(p.total_sold) }))} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                                <RechartsTooltip />
                                <Bar dataKey="sold" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top Clients */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Users size={18} className="text-green-600" />
                        Meilleurs clients (30j)
                    </h2>
                    {data.top_clients?.length === 0 ? (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">Aucune donnée</div>
                    ) : (
                        <div className="space-y-3">
                            {data.top_clients?.map((c, i) => (
                                <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                        {c.full_name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{c.full_name}</p>
                                        <p className="text-xs text-gray-400">{c.total_purchases} achat(s)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">{formatFCFA(c.total_spent)}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-20">
                                                <div
                                                    className="bg-green-500 h-1.5 rounded-full"
                                                    style={{ width: `${Math.min(100, (c.total_spent / (data.top_clients[0]?.total_spent || 1)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
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