// components/profits/ProfitCharts.jsx
'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, PieChart, Layers, Eye } from 'lucide-react';

const CATEGORY_COLORS = [
  '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6',
  '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
];

export default function ProfitCharts({
  evolution = [],
  categories = [],
  isLoading
}) {
  const [visibleSeries, setVisibleSeries] = useState({
    revenue: true,
    cogs: true,
    grossMargin: true,
    expenses: true,
    netProfit: true
  });

  const toggleSeries = (key) => {
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M F`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k F`;
    return `${val} F`;
  };

  const CustomEvolutionTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;

    return (
      <div className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md p-3 rounded-xl border border-gray-200 dark:border-[#374151] shadow-lg text-xs space-y-1.5 min-w-[200px]">
        <p className="font-bold text-gray-900 dark:text-[#F9FAFB] pb-1 border-b border-gray-100 dark:border-[#374151]">
          {data?.formattedDate || label} ({data?.salesCount || 0} ventes)
        </p>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
            <span>CA Net :</span>
            <span className="font-semibold">{Math.round(data?.revenue || 0).toLocaleString('fr-FR')} F</span>
          </div>
          <div className="flex justify-between items-center text-purple-600 dark:text-purple-400">
            <span>Coût d'achat :</span>
            <span className="font-semibold">{Math.round(data?.cogs || 0).toLocaleString('fr-FR')} F</span>
          </div>
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
            <span>Marge Brute :</span>
            <span className="font-semibold">{Math.round(data?.grossMargin || 0).toLocaleString('fr-FR')} F ({data?.marginPercentage}%)</span>
          </div>
          <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
            <span>Dépenses :</span>
            <span className="font-semibold">{Math.round(data?.expenses || 0).toLocaleString('fr-FR')} F</span>
          </div>
          <div className="flex justify-between items-center text-brand-600 dark:text-brand-400 pt-1 border-t border-gray-100 dark:border-[#374151] font-bold">
            <span>Bénéfice Net :</span>
            <span>{Math.round(data?.netProfit || 0).toLocaleString('fr-FR')} F</span>
          </div>
        </div>
      </div>
    );
  };

  const CustomCategoryTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;

    return (
      <div className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md p-3 rounded-xl border border-gray-200 dark:border-[#374151] shadow-lg text-xs space-y-1.5 min-w-[200px]">
        <p className="font-bold text-gray-900 dark:text-[#F9FAFB] pb-1 border-b border-gray-100 dark:border-[#374151]">
          {data?.categoryName}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-gray-600 dark:text-[#D1D5DB]">
            <span>CA Net :</span>
            <span className="font-semibold">{Math.round(data?.netRevenue || 0).toLocaleString('fr-FR')} F</span>
          </div>
          <div className="flex justify-between items-center text-purple-600 dark:text-purple-400">
            <span>Coût d'achat :</span>
            <span className="font-semibold">{Math.round(data?.cogs || 0).toLocaleString('fr-FR')} F</span>
          </div>
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
            <span>Marge Brute :</span>
            <span>{Math.round(data?.grossMargin || 0).toLocaleString('fr-FR')} F ({data?.marginPercentage}%)</span>
          </div>
          <div className="flex justify-between items-center text-gray-500 dark:text-[#9CA3AF] text-[11px]">
            <span>Articles vendus :</span>
            <span>{data?.netQuantity}</span>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-gray-100 dark:bg-[#1F2937]/50 rounded-2xl animate-pulse border border-gray-200 dark:border-[#374151]" />
        <div className="h-80 bg-gray-100 dark:bg-[#1F2937]/50 rounded-2xl animate-pulse border border-gray-200 dark:border-[#374151]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Graphique d'évolution temporelle */}
      <Card className="lg:col-span-2 bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs">
        <CardHeader className="pb-2 border-b border-gray-100 dark:border-[#374151]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB] flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-600 dark:text-brand-400" />
              Évolution Financière (CA, Marges & Dépenses)
            </CardTitle>
            <p className="text-xs text-gray-500 dark:text-[#9CA3AF] mt-0.5">
              Suivi de la dynamique de rentabilité sur la période
            </p>
          </div>

          {/* Boutons d'affichage des séries */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => toggleSeries('revenue')}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                visibleSeries.revenue
                  ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  : 'bg-gray-100 dark:bg-[#1F2937] text-gray-400 opacity-60'
              }`}
            >
              CA Net
            </button>
            <button
              onClick={() => toggleSeries('grossMargin')}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                visibleSeries.grossMargin
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-gray-100 dark:bg-[#1F2937] text-gray-400 opacity-60'
              }`}
            >
              Marge Brute
            </button>
            <button
              onClick={() => toggleSeries('expenses')}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                visibleSeries.expenses
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-gray-100 dark:bg-[#1F2937] text-gray-400 opacity-60'
              }`}
            >
              Dépenses
            </button>
            <button
              onClick={() => toggleSeries('netProfit')}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                visibleSeries.netProfit
                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-gray-100 dark:bg-[#1F2937] text-gray-400 opacity-60'
              }`}
            >
              Bénéfice Net
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {evolution.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-gray-400 dark:text-[#9CA3AF] text-xs">
              <Layers size={32} className="mb-2 opacity-40" />
              Aucune donnée d'évolution disponible pour cette période.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={evolution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.15} />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#374151', strokeOpacity: 0.2 }}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    tickLine={false}
                    axisLine={{ stroke: '#374151', strokeOpacity: 0.2 }}
                  />
                  <Tooltip content={<CustomEvolutionTooltip />} />

                  {/* CA Net */}
                  {visibleSeries.revenue && (
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="CA Net"
                      fill="#3B82F6"
                      fillOpacity={0.08}
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                  )}

                  {/* Marge Brute */}
                  {visibleSeries.grossMargin && (
                    <Line
                      type="monotone"
                      dataKey="grossMargin"
                      name="Marge Brute"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#10B981' }}
                    />
                  )}

                  {/* Dépenses */}
                  {visibleSeries.expenses && (
                    <Bar
                      dataKey="expenses"
                      name="Dépenses"
                      fill="#F59E0B"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />
                  )}

                  {/* Bénéfice Net */}
                  {visibleSeries.netProfit && (
                    <Line
                      type="monotone"
                      dataKey="netProfit"
                      name="Bénéfice Net"
                      stroke="#6366F1"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: '#6366F1' }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Répartition par Catégorie */}
      <Card className="bg-white dark:bg-[#111827] border-gray-200 dark:border-[#374151] shadow-xs">
        <CardHeader className="pb-2 border-b border-gray-100 dark:border-[#374151]/60">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-[#F9FAFB] flex items-center gap-2">
            <PieChart size={18} className="text-emerald-600 dark:text-emerald-400" />
            Marge par Catégorie
          </CardTitle>
          <p className="text-xs text-gray-500 dark:text-[#9CA3AF] mt-0.5">
            Contribution des rayons au bénéfice global
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          {categories.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-gray-400 dark:text-[#9CA3AF] text-xs">
              <PieChart size={32} className="mb-2 opacity-40" />
              Aucune catégorie vendue sur cette période.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categories.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} horizontal={false} />
                    <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                    <YAxis dataKey="categoryName" type="category" width={80} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                    <Tooltip content={<CustomCategoryTooltip />} />
                    <Bar dataKey="grossMargin" radius={[0, 4, 4, 0]} maxBarSize={16}>
                      {categories.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Mini-liste détaillée des catégories */}
              <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                {categories.slice(0, 4).map((cat, idx) => (
                  <div
                    key={cat.categoryId || idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 dark:bg-[#1F2937]/40 border border-gray-100 dark:border-[#374151]/50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      />
                      <span className="font-semibold text-gray-800 dark:text-[#F9FAFB] truncate max-w-[110px]">
                        {cat.categoryName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(cat.grossMargin)}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-[#9CA3AF] ml-1.5">
                        ({cat.marginPercentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
