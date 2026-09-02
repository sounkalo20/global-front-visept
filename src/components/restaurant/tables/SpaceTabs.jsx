'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Map, Plus, Settings } from 'lucide-react';

export default function SpaceTabs({
  spaces = [],
  activeSpaceId,
  onSelectSpace,
  viewMode,
  onToggleViewMode,
  onOpenManage,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border shadow-sm">
      {/* Tabs des espaces */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <button
          onClick={() => onSelectSpace(null)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
            activeSpaceId === null
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous les espaces
        </button>

        {spaces.map((space) => {
          const isActive = activeSpaceId === space.id;
          return (
            <button
              key={space.id}
              onClick={() => onSelectSpace(space.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{space.name}</span>
              {space.tables_count > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {space.tables_count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mode de vue & Action Manage */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border">
          <button
            onClick={() => onToggleViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Vue en grille"
          >
            <LayoutGrid size={16} />
            <span className="hidden md:inline">Grille</span>
          </button>

          <button
            onClick={() => onToggleViewMode('plan')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'plan'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Plan 2D"
          >
            <Map size={16} />
            <span className="hidden md:inline">Plan 2D</span>
          </button>
        </div>

        {onOpenManage && (
          <Button variant="outline" size="sm" onClick={onOpenManage} className="rounded-xl gap-1.5">
            <Settings size={16} />
            <span className="hidden sm:inline">Gérer les tables</span>
          </Button>
        )}
      </div>
    </div>
  );
}
