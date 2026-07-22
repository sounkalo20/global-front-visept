'use client';
import { useEffect, useState } from 'react';
import useSuperAdminOwnerStore from '@/store/superAdmin/superAdminOwnerStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import OwnersTable from '@/components/super-admin/owners/OwnersTable';
import OwnerModal from '@/components/super-admin/owners/OwnerModal';

export default function OwnersPage() {
    const { fetchOwners } = useSuperAdminOwnerStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOwners();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Propriétaires</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Gérez les propriétaires et leurs accès illimités
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus size={16} />
                    Nouveau propriétaire
                </Button>
            </div>

            <OwnersTable />

            <OwnerModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}
