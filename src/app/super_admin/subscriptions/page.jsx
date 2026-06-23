// app/super_admin/plans/page.jsx
'use client';
import { useEffect } from 'react';
import PlanStatsCards from '@/components/super-admin/PlanStatsCards';
import PlansTable from '@/components/super-admin/PlansTable';
import useSuperAdminPlanStore from '@/store/superAdmin/superAdminPlanStore';

export default function Subscription() {
    const { stats, fetchPlans, fetchStats } = useSuperAdminPlanStore();

    useEffect(() => {
        fetchPlans();
        fetchStats();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Plans d'abonnement</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Gérez les plans tarifaires de la plateforme
                </p>
            </div>

            {/* Stats cards */}
            <PlanStatsCards stats={stats} />

            {/* Table + actions */}
            <PlansTable />
        </div>
    );
}