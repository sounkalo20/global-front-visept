// app/super_admin/payments/page.jsx
'use client';
import { useEffect } from 'react';
import PaymentStatsCards from '@/components/super-admin/PaymentStatsCards';
import PaymentsTable from '@/components/super-admin/PaymentsTable';
import useSuperAdminPaymentStore from '@/store/superAdmin/superAdminPaymentStore';

export default function PaymentsPage() {
    const { payments, fetchPayments } = useSuperAdminPaymentStore();

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Paiements en attente</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Validez ou rejetez les preuves de paiement des abonnements
                </p>
            </div>

            {/* Stats cards */}
            <PaymentStatsCards payments={payments} />

            {/* Table */}
            <PaymentsTable />
        </div>
    );
}