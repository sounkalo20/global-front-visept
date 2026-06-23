// app/shop/supplier-orders/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OrderStatsCards from '@/components/supplier-orders/OrderStatsCards';
import OrderFilters from '@/components/supplier-orders/OrderFilters';
import OrdersTable from '@/components/supplier-orders/OrdersTable';
import OrderFormModal from '@/components/supplier-orders/OrderFormModal';
import useSupplierOrderStore from '@/store/supplierOrderStore';

export default function SupplierOrdersPage() {
    const { stats, filters, setFilters, fetchOrders } = useSupplierOrderStore();
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => { fetchOrders(); }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Package size={24} className="text-brand-600" />Commandes fournisseurs</h1>
                    <p className="text-gray-500 text-sm mt-1">Gérez vos bons de commande et réceptions</p>
                </div>
                <Button onClick={() => setFormOpen(true)}><Plus size={16} className="mr-2" />Nouvelle commande</Button>
            </div>
            <OrderStatsCards stats={stats} />
            <OrderFilters filters={filters} onFiltersChange={setFilters} />
            <OrdersTable />
            <OrderFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
        </div>
    );
}