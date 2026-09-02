'use client';
import {
  CheckCircle2,
  Utensils,
  Receipt,
  Sparkles,
  Bookmark,
  Ban,
  Clock,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const STATUS_CONFIG = {
  available: {
    label: 'Libre',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    cardBorder: 'hover:border-emerald-500 border-gray-200',
    headerBg: 'bg-emerald-50 text-emerald-900',
    accentColor: 'text-emerald-600',
    dotColor: 'bg-emerald-500',
  },
  occupied: {
    label: 'Occupée',
    icon: Utensils,
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    cardBorder: 'border-rose-400 hover:border-rose-600 shadow-sm',
    headerBg: 'bg-rose-500 text-white',
    accentColor: 'text-rose-600',
    dotColor: 'bg-rose-500',
  },
  bill_requested: {
    label: 'Addition demandée',
    icon: Receipt,
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    cardBorder: 'border-amber-400 hover:border-amber-600 shadow-md ring-2 ring-amber-400/30',
    headerBg: 'bg-amber-500 text-white',
    accentColor: 'text-amber-600',
    dotColor: 'bg-amber-500',
  },
  needs_cleaning: {
    label: 'À nettoyer',
    icon: Sparkles,
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    cardBorder: 'border-slate-300 hover:border-slate-400 bg-slate-50/50',
    headerBg: 'bg-slate-400 text-white',
    accentColor: 'text-slate-600',
    dotColor: 'bg-slate-400',
  },
  reserved: {
    label: 'Réservée',
    icon: Bookmark,
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    cardBorder: 'border-purple-300 hover:border-purple-500',
    headerBg: 'bg-purple-600 text-white',
    accentColor: 'text-purple-600',
    dotColor: 'bg-purple-600',
  },
  out_of_service: {
    label: 'Hors service',
    icon: Ban,
    badgeBg: 'bg-gray-100 text-gray-700 border-gray-300',
    cardBorder: 'border-gray-200 opacity-60',
    headerBg: 'bg-gray-700 text-white',
    accentColor: 'text-gray-500',
    dotColor: 'bg-gray-700',
  },
};

export default function TableGridCard({ table, onClick, showSpaceName = false }) {
  const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
  const Icon = config.icon;

  const isOccupiedOrBill = table.status === 'occupied' || table.status === 'bill_requested';
  const totalAmount = Number(table.total_amount || 0);

  return (
    <div
      onClick={() => onClick(table)}
      className={`bg-white border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${config.cardBorder}`}
    >
      {/* En-tête de la carte */}
      <div className={`px-4 py-2.5 flex items-center justify-between font-medium ${config.headerBg}`}>
        <div className="flex items-center gap-2">
          <Icon size={18} />
          <span className="font-bold text-base tracking-wide">
            {table.table_number ? `Table ${table.table_number}` : table.table_name}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs opacity-90">
          <Users size={14} />
          <span>{table.number_of_guests || table.capacity} pers.</span>
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Nom complémentaire & Espace */}
        <div>
          {table.table_name && table.table_number && (
            <p className="text-xs text-gray-500 font-medium truncate mb-1">{table.table_name}</p>
          )}
          {showSpaceName && table.space_name && (
            <Badge variant="outline" className="text-[11px] font-normal text-gray-500 bg-gray-50">
              {table.space_name}
            </Badge>
          )}
        </div>

        {/* Informations session si occupée */}
        {isOccupiedOrBill ? (
          <div className="space-y-2 pt-1 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-gray-400" />
                {table.duration_minutes || 0} min
              </span>
              <span className="truncate max-w-[110px] text-right font-medium text-gray-700">
                {table.staff_name || 'Serveur'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-500">
                {table.items_count || 0} plat{(table.items_count || 0) > 1 ? 's' : ''}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {totalAmount.toLocaleString()} FCFA
              </span>
            </div>
          </div>
        ) : table.status === 'needs_cleaning' ? (
          <div className="py-2 text-center text-xs font-semibold text-slate-600 bg-slate-100/70 rounded-xl">
            Cliquez pour libérer
          </div>
        ) : table.status === 'reserved' ? (
          <div className="py-2 text-center text-xs font-semibold text-purple-700 bg-purple-50 rounded-xl">
            Client attendu
          </div>
        ) : (
          <div className="py-2 text-center text-xs font-medium text-emerald-600 bg-emerald-50/60 rounded-xl">
            Prête à recevoir
          </div>
        )}
      </div>

      {/* Pied de carte */}
      <div className="px-4 py-2 bg-gray-50/70 border-t flex items-center justify-between text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{config.label}</span>
        <ChevronRight size={14} className="text-gray-400" />
      </div>
    </div>
  );
}
