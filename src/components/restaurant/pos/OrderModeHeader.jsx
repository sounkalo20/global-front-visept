'use client';
import { useState, useEffect } from 'react';
import { Utensils, LayoutGrid, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useCompanyStore from '@/store/companyStore';
import useRestaurantCartStore from '@/store/restaurantCartStore';
import axios from '@/lib/axios';

export default function OrderModeHeader({ onOpenTableSelector }) {
  const { activeCompany } = useCompanyStore();
  const cart = useRestaurantCartStore();
  const [occupiedTablesCount, setOccupiedTablesCount] = useState(0);

  useEffect(() => {
    const fetchTableStats = async () => {
      if (!activeCompany?.id) return;
      try {
        const res = await axios.get('/restaurant/tables', {
          headers: { 'x-company-id': activeCompany.id },
        });
        if (res.data.success) {
          const occupied = (res.data.data.tables || []).filter(t => t.status === 'occupied' || t.status === 'bill_requested');
          setOccupiedTablesCount(occupied.length);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTableStats();
  }, [activeCompany?.id]);

  return (
    <div className="bg-slate-900 text-white px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-md shrink-0">
      {/* Table Active Context */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onOpenTableSelector}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 h-9 px-3"
        >
          <Utensils size={15} />
          {cart.tableId ? (
            <span>Table #{cart.tableName || cart.tableId}</span>
          ) : (
            <span>Sélectionner une Table</span>
          )}
        </Button>

        {cart.numberOfGuests > 0 && cart.tableId && (
          <Badge className="bg-slate-800 text-slate-200 border-slate-700 text-xs">
            {cart.numberOfGuests} couvert(s)
          </Badge>
        )}
      </div>

      {/* Stats tables occupées */}
      <div className="flex items-center gap-3 text-xs">
        <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
          <LayoutGrid size={14} className="text-amber-500" />
          <span className="font-medium">{occupiedTablesCount} table(s) occupée(s)</span>
        </div>
      </div>
    </div>
  );
}
