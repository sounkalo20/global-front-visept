'use client';
import { useEffect, useState } from 'react';
import { Box, Plus, Edit, Trash, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useWarehouseStore from '@/store/warehouseStore';
import { useRouter } from 'next/navigation';
import WarehouseFormModal from '@/components/warehouses/WarehouseFormModal';

export default function WarehousesPage() {
    const { warehouses, fetchWarehouses, isLoading } = useWarehouseStore();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleEdit = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setFormOpen(true);
    };

    const handleOpenForm = () => {
        setSelectedWarehouse(null);
        setFormOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Titre + bouton */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Box size={24} className="text-brand-600" />
                        Entrepôts
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Gérez vos entrepôts, suivez vos stocks globaux et transférez vers vos boutiques
                    </p>
                </div>
                <Button onClick={handleOpenForm}>
                    <Plus size={16} className="mr-2" />
                    Nouvel entrepôt
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                </div>
            ) : warehouses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                    <Box className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Aucun entrepôt</h3>
                    <p className="text-gray-500 mt-1 mb-4">Commencez par créer votre premier entrepôt.</p>
                    <Button onClick={handleOpenForm}>Créer un entrepôt</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {warehouses.map(warehouse => (
                        <div key={warehouse.id} className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{warehouse.name}</h3>
                                    {warehouse.address && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{warehouse.address}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEdit(warehouse)}
                                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            {warehouse.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {warehouse.description}
                                </p>
                            )}
                            
                            <div className="pt-4 border-t mt-auto">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-between"
                                    onClick={() => router.push(`/shop/warehouses/${warehouse.id}`)}
                                >
                                    Gérer les stocks
                                    <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <WarehouseFormModal
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                warehouse={selectedWarehouse}
            />
        </div>
    );
}
