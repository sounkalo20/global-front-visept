// app/restaurant/debts/page.jsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DebtStatsCards from '@/components/restaurant/debts/DebtStatsCards';
import DebtFilters from '@/components/restaurant/debts/DebtFilters';
import DebtsTable from '@/components/restaurant/debts/DebtsTable';
import PaymentsTable from '@/components/restaurant/debts/PaymentsTable';
import ClientDebtSummary from '@/components/restaurant/debts/ClientDebtSummary';
import useRestaurantDebtStore from '@/store/restaurantDebtStore';
import useRestaurantPaymentStore from '@/store/restaurantPaymentStore';

export default function DebtsPage() {
  const router = useRouter();
  const { stats, filters, setFilters, fetchDebts, fetchStats } = useRestaurantDebtStore();
  const { filters: payFilters, setFilters: setPayFilters, fetchPayments } = useRestaurantPaymentStore();

  useEffect(() => {
    fetchDebts();
    fetchStats();
    fetchPayments();
  }, []);

  const handleClientFilter = (client) => {
    setFilters({ client_id: String(client.client_id) });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard size={24} className="text-red-600" />
            Dettes & Paiements
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gérez les crédits clients et les remboursements</p>
        </div>
        <Button onClick={() => router.push('/restaurant/debts/new')}>
          <Plus size={16} className="mr-2" />Nouvelle vente à crédit
        </Button>
      </div>

      <DebtStatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Résumé par client */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-4 sticky top-20">
            <ClientDebtSummary onSelectClient={handleClientFilter} />
          </div>
        </div>

        {/* Tabs */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="debts">
            <TabsList>
              <TabsTrigger value="debts" className="flex items-center gap-1.5">
                <CreditCard size={14} />Dettes
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1.5">
                <Receipt size={14} />Paiements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="debts" className="space-y-4 mt-4">
              <DebtFilters filters={filters} onFiltersChange={setFilters} />
              <DebtsTable />
            </TabsContent>

            <TabsContent value="payments" className="space-y-4 mt-4">
              <PaymentsTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}