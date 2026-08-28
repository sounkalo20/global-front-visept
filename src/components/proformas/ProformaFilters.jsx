'use client';
import { Search, RotateCcw, Calendar, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProformaFilters({ filters, onFilterChange, onReset }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recherche libre */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="N° Proforma, nom client..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>

        {/* Statut */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(val) => onFilterChange('status', val === 'all' ? '' : val)}
        >
          <SelectTrigger className="bg-gray-50 border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter size={16} className="text-gray-400" />
              <SelectValue placeholder="Tous les statuts" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actif / En attente</SelectItem>
            <SelectItem value="converted">Converti en vente</SelectItem>
            <SelectItem value="canceled">Annulé</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Début */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => onFilterChange('start_date', e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Date Fin */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => onFilterChange('end_date', e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Réinitialisation */}
      {(filters.search || filters.status || filters.start_date || filters.end_date) && (
        <div className="flex justify-end border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700 text-xs"
          >
            <RotateCcw size={14} className="mr-1.5" />
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
