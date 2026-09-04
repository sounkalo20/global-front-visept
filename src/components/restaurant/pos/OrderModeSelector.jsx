'use client';
import { Utensils, Store, ShoppingBag, Truck } from 'lucide-react';

const modes = [
  { id: 'dine_in', label: 'Sur Table', icon: Utensils },
  { id: 'counter', label: 'Comptoir', icon: Store },
  { id: 'takeaway', label: 'À emporter', icon: ShoppingBag },
  { id: 'delivery', label: 'Livraison', icon: Truck },
];

export default function OrderModeSelector({ value, onChange }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
      {modes.map((m) => {
        const Icon = m.icon;
        const active = value === m.id;

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              active
                ? 'bg-white shadow-xs text-brand-700 font-extrabold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon size={14} className={active ? 'text-brand-600' : 'text-gray-400'} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
