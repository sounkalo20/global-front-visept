'use client';
import { useState, useRef } from 'react';
import { STATUS_CONFIG } from './TableGridCard';
import { Users, Clock, Save, Edit3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FloorPlanView({ tables = [], onSelectTable, onSavePositions, isEditable = false }) {
  const [positions, setPositions] = useState({});
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef(null);

  const handleMouseDown = (e, table) => {
    if (!editMode) return;
    e.preventDefault();
    setDraggingId(table.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!draggingId || !canvasRef.current || !editMode) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvasRect.width - 100, e.clientX - canvasRect.left - dragOffset.x));
    const y = Math.max(0, Math.min(canvasRect.height - 100, e.clientY - canvasRect.top - dragOffset.y));

    setPositions((prev) => ({
      ...prev,
      [draggingId]: { position_x: Math.round(x), position_y: Math.round(y) },
    }));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = Object.entries(positions).map(([id, pos]) => ({
      id: Number(id),
      position_x: pos.position_x,
      position_y: pos.position_y,
    }));

    if (payload.length > 0 && onSavePositions) {
      await onSavePositions(payload);
    }
    setIsSaving(false);
    setEditMode(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* En-tête mode d'édition du plan */}
      {isEditable && (
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border shadow-sm">
          <span className="text-sm font-medium text-gray-700">
            {editMode ? 'Glissez-déposez les tables pour ajuster le plan' : 'Mode vue du plan 2D'}
          </span>

          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-brand-600 hover:bg-brand-700 text-white">
                  <Save size={14} className="mr-1" />
                  {isSaving ? 'Enregistrement...' : 'Sauvegarder les positions'}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                <Edit3 size={14} className="mr-1" /> Modifier la disposition
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Surface de la salle 2D */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[600px] bg-slate-100/90 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden shadow-inner bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]"
      >
        {tables.map((table) => {
          const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
          const pos = positions[table.id] || {
            position_x: table.position_x || 20,
            position_y: table.position_y || 20,
          };
          const Icon = config.icon;

          const isRound = table.shape === 'round';
          const totalAmount = Number(table.total_amount || 0);

          return (
            <div
              key={table.id}
              onMouseDown={(e) => handleMouseDown(e, table)}
              onClick={() => {
                if (!editMode && onSelectTable) onSelectTable(table);
              }}
              style={{
                left: `${pos.position_x}px`,
                top: `${pos.position_y}px`,
                width: `${table.width || 90}px`,
                height: `${table.height || 90}px`,
              }}
              className={`absolute flex flex-col items-center justify-center p-2 text-center transition-all cursor-pointer shadow-md select-none border-2 ${
                isRound ? 'rounded-full' : 'rounded-2xl'
              } ${config.headerBg} ${config.cardBorder} ${
                editMode ? 'cursor-move ring-2 ring-blue-400/50' : 'hover:scale-105'
              }`}
            >
              <span className="font-bold text-xs truncate max-w-full px-1">
                {table.table_number ? `T.${table.table_number}` : table.table_name}
              </span>

              <div className="flex items-center gap-1 text-[10px] opacity-90 mt-0.5">
                <Users size={11} />
                <span>{table.number_of_guests || table.capacity}</span>
              </div>

              {totalAmount > 0 && (
                <span className="text-[10px] font-extrabold bg-black/20 px-1.5 py-0.5 rounded-full mt-1">
                  {(totalAmount / 1000).toFixed(0)}k
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
