// app/super_admin/companies/page.jsx
'use client';
import { useEffect } from 'react';
import CompanyStatsCards from '@/components/super-admin/CompanyStatsCards';
import CompanyFilters from '@/components/super-admin/CompanyFilters';
import CompaniesTable from '@/components/super-admin/CompaniesTable';
import useSuperAdminCompanyStore from '@/store/superAdmin/superAdminCompanyStore';
import useSuperAdminDashboardStore from '@/store/superAdmin/superAdminDashboardStore';

export default function CompaniesPage() {
    const { fetchCompanies, fetchStats, filters, setFilters } = useSuperAdminCompanyStore();
    const { stats, fetchDashboardStats } = useSuperAdminDashboardStore();

    useEffect(() => {
        fetchDashboardStats();
        fetchCompanies();
        fetchStats();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Entreprises</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Gérez toutes les entreprises de la plateforme
                </p>
            </div>

            {/* Stats cards */}
            <CompanyStatsCards stats={stats} />

            {/* Filtres */}
            <CompanyFilters filters={filters} onFiltersChange={setFilters} />

            {/* Table */}
            <CompaniesTable />
        </div>
    );
}