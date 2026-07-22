// app/super_admin/companies/page.jsx
'use client';
import { useEffect } from 'react';
import { useState } from 'react';
import CompanyStatsCards from '@/components/super-admin/CompanyStatsCards';
import CompanyFilters from '@/components/super-admin/CompanyFilters';
import CompaniesTable from '@/components/super-admin/CompaniesTable';
import CompanyAdminModal from '@/components/super-admin/companies/CompanyAdminModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import useSuperAdminCompanyStore from '@/store/superAdmin/superAdminCompanyStore';

export default function CompaniesPage() {
    const { fetchCompanies, fetchStats, stats, filters, setFilters } = useSuperAdminCompanyStore();

    useEffect(() => {
        fetchCompanies();
        fetchStats();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Entreprises</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Gérez toutes les entreprises de la plateforme
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus size={16} />
                    Nouvelle boutique
                </Button>
            </div>

            {/* Stats cards */}
            <CompanyStatsCards stats={stats} />

            {/* Filtres */}
            <CompanyFilters filters={filters} onFiltersChange={setFilters} />

            {/* Table */}
            <CompaniesTable />

            <CompanyAdminModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}