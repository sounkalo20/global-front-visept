// app/restaurant/dishes/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { Utensils, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import useRestaurantDishStore from '@/store/restaurantDishStore';
import DishStatsCards from '@/components/restaurant/dishes/DishStatsCards';
import DishFilters from '@/components/restaurant/dishes/DishFilters';
import DishesTable from '@/components/restaurant/dishes/DishesTable';
import DishFormModal from '@/components/restaurant/dishes/DishFormModal';

export default function DishesPage() {
  const { stats, filters, setFilters, fetchDishes } = useRestaurantDishStore();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => { fetchDishes(); }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Utensils size={24} className="text-orange-600" />Plats
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gérez votre menu</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} className="mr-2" />Nouveau plat
        </Button>
      </div>

      <DishStatsCards stats={stats} />
      <DishFilters filters={filters} onFiltersChange={setFilters} />
      <DishesTable />
      <DishFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}