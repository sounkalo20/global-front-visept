'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRightLeft, Package, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useWarehouseStore from '@/store/warehouseStore';
import TransferModal from '@/components/warehouses/TransferModal';
import ExportWarehouseStockPDFButton from '@/components/warehouses/ExportWarehouseStockPDFButton';
import ExportWarehouseHistoryPDFDialog from '@/components/warehouses/ExportWarehouseHistoryPDFDialog';

export default function WarehouseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { 
        currentWarehouse, 
        stocks, 
        movements, 
        getWarehouseById, 
        fetchWarehouseStocks, 
        fetchWarehouseMovements,
        isLoading 
    } = useWarehouseStore();

    const [activeTab, setActiveTab] = useState('stocks');
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        if (id) {
            getWarehouseById(id);
            fetchWarehouseStocks(id);
            fetchWarehouseMovements(id);
        }
    }, [id]);

    const handleTransfer = (stock) => {
        setSelectedProduct(stock);
        setTransferModalOpen(true);
    };

    if (isLoading && !currentWarehouse) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!currentWarehouse) return null;

    return (
        <div className="p-6 space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/shop/warehouses')}
                        className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{currentWarehouse.name}</h1>
                        {currentWarehouse.address && (
                            <p className="text-sm text-gray-500 mt-1">{currentWarehouse.address}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {activeTab === 'stocks' && (
                        <ExportWarehouseStockPDFButton warehouseId={id} warehouseName={currentWarehouse.name} />
                    )}
                    {activeTab === 'movements' && (
                        <ExportWarehouseHistoryPDFDialog warehouseId={id} warehouseName={currentWarehouse.name} />
                    )}
                </div>
            </div>

            {/* Onglets */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab('stocks')}
                    className={`pb-3 px-1 border-b-2 font-medium flex items-center gap-2 ${
                        activeTab === 'stocks' 
                            ? 'border-brand-600 text-brand-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Package size={18} />
                    Stock actuel
                </button>
                <button
                    onClick={() => setActiveTab('movements')}
                    className={`pb-3 px-1 border-b-2 font-medium flex items-center gap-2 ${
                        activeTab === 'movements' 
                            ? 'border-brand-600 text-brand-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <History size={18} />
                    Historique des mouvements
                </button>
            </div>

            {/* Contenu */}
            {activeTab === 'stocks' && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-sm text-gray-500">
                                    <th className="px-6 py-4 font-medium">Produit</th>
                                    <th className="px-6 py-4 font-medium">SKU/Code-barres</th>
                                    <th className="px-6 py-4 font-medium">Quantité en entrepôt</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {stocks.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            Aucun stock dans cet entrepôt.
                                        </td>
                                    </tr>
                                ) : (
                                    stocks.map((stock) => (
                                        <tr key={stock.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{stock.product_name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {stock.sku || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    parseFloat(stock.quantity) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {stock.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    disabled={parseFloat(stock.quantity) <= 0}
                                                    onClick={() => handleTransfer(stock)}
                                                >
                                                    <ArrowRightLeft size={14} className="mr-2" />
                                                    Transférer
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'movements' && (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-sm text-gray-500">
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Produit</th>
                                    <th className="px-6 py-4 font-medium">Type</th>
                                    <th className="px-6 py-4 font-medium">Quantité</th>
                                    <th className="px-6 py-4 font-medium">Avant/Après</th>
                                    <th className="px-6 py-4 font-medium">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {movements.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            Aucun mouvement enregistré.
                                        </td>
                                    </tr>
                                ) : (
                                    movements.map((mov) => (
                                        <tr key={mov.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(mov.created_at).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {mov.product_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {mov.movement_type === 'in_from_supplier' && (
                                                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium border border-green-200">Entrée (Fournisseur)</span>
                                                )}
                                                {mov.movement_type === 'transfer_to_shop' && (
                                                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium border border-blue-200">Transfert (Boutique)</span>
                                                )}
                                                {mov.movement_type !== 'in_from_supplier' && mov.movement_type !== 'transfer_to_shop' && (
                                                    <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded text-xs font-medium border border-gray-200">{mov.movement_type}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={parseFloat(mov.quantity) > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {parseFloat(mov.quantity) > 0 ? '+' : ''}{mov.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {mov.stock_before} → {mov.stock_after}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {mov.notes}
                                                {mov.destination_company_name && (
                                                    <div className="text-brand-600 mt-1">
                                                        Vers: {mov.destination_company_name}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <TransferModal
                isOpen={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                stock={selectedProduct}
                warehouseId={id}
            />
        </div>
    );
}
