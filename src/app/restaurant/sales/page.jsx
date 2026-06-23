// app/restaurant/sales/page.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useRestaurantSaleStore from '@/store/restaurantSaleStore';
import SaleStatsCards from '@/components/restaurant/sales/SaleStatsCards';
import SaleFilters from '@/components/restaurant/sales/SaleFilters';
import SalesTable from '@/components/restaurant/sales/SalesTable';

export default function SalesPage() {
  const router = useRouter();
  const { stats, filters, setFilters, fetchSales, fetchStats } = useRestaurantSaleStore();

  useEffect(() => {
    fetchSales();
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart size={24} className="text-orange-600" />
            Commandes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Historique des ventes du restaurant</p>
        </div>
        <Button onClick={() => router.push('/restaurant/sales/new')}>
          <Plus size={16} className="mr-2" />Nouvelle commande
        </Button>
      </div>

      <SaleStatsCards stats={stats} />
      <SaleFilters filters={filters} onFiltersChange={setFilters} />
      <SalesTable />
    </div>
  );
}