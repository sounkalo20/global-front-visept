'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRightLeft,
    Package,
    History,
    Plus,
    Minus,
    Filter,
    Calendar,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useWarehouseStore from '@/store/warehouseStore';
import TransferModal from '@/components/warehouses/TransferModal';
import AdjustStockModal from '@/components/warehouses/AdjustStockModal';
import ExportWarehouseStockPDFButton from '@/components/warehouses/ExportWarehouseStockPDFButton';
import ExportWarehouseHistoryPDFDialog from '@/components/warehouses/ExportWarehouseHistoryPDFDialog';
import CancelTransferModal from '@/components/warehouses/CancelTransferModal';

export default function WarehouseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const {
        currentWarehouse,
        stocks,
        movements,
        adjustments,
        pagination,
        getWarehouseById,
        fetchWarehouseStocks,
        fetchWarehouseMovements,
        fetchWarehouseAdjustments,
        isLoading
    } = useWarehouseStore();

    const [activeTab, setActiveTab] = useState('stocks');
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cancelModalMovement, setCancelModalMovement] = useState(null);
    const [adjustmentFilter, setAdjustmentFilter] = useState({
        start_date: '',
        end_date: '',
        reason: ''
    });
    const [adjustmentPage, setAdjustmentPage] = useState(1);

    useEffect(() => {
        if (id) {
            getWarehouseById(id);
            fetchWarehouseStocks(id);
            fetchWarehouseMovements(id);
            fetchWarehouseAdjustments(id, { page: adjustmentPage, limit: 50 });
        }
    }, [id, adjustmentPage]);

    const handleTransfer = (stock) => {
        setSelectedProduct(stock);
        setTransferModalOpen(true);
    };

    const handleAdjust = (stock) => {
        setSelectedProduct(stock);
        setAdjustModalOpen(true);
    };

    const handleAdjustmentFilter = () => {
        const params = {
            page: 1,
            limit: 50
        };
        if (adjustmentFilter.start_date) params.start_date = adjustmentFilter.start_date;
        if (adjustmentFilter.end_date) params.end_date = adjustmentFilter.end_date;
        if (adjustmentFilter.reason && adjustmentFilter.reason !== 'all') {
            params.reason = adjustmentFilter.reason;
        }
        fetchWarehouseAdjustments(id, params);
        setAdjustmentPage(1);
    };

    const resetAdjustmentFilter = () => {
        setAdjustmentFilter({ start_date: '', end_date: '', reason: '' });
        fetchWarehouseAdjustments(id, { page: 1, limit: 50 });
        setAdjustmentPage(1);
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
            <div className="flex gap-6 border-b">
                <button
                    onClick={() => setActiveTab('stocks')}
                    className={`pb-3 px-1 border-b-2 font-medium flex items-center gap-2 ${activeTab === 'stocks'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Package size={18} />
                    Stock actuel
                </button>
                <button
                    onClick={() => setActiveTab('movements')}
                    className={`pb-3 px-1 border-b-2 font-medium flex items-center gap-2 ${activeTab === 'movements'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <History size={18} />
                    Historique
                </button>
                <button
                    onClick={() => setActiveTab('adjustments')}
                    className={`pb-3 px-1 border-b-2 font-medium flex items-center gap-2 ${activeTab === 'adjustments'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Filter size={18} />
                    Ajustements
                </button>
            </div>

            {/* Contenu - Stocks */}
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
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
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
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parseFloat(stock.quantity) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {Number(stock.quantity)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAdjust(stock)}
                                                >
                                                    <Plus size={14} className="mr-1" />
                                                    Ajuster
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={parseFloat(stock.quantity) <= 0}
                                                    onClick={() => handleTransfer(stock)}
                                                >
                                                    <ArrowRightLeft size={14} className="mr-1" />
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

            {/* Contenu - Historique des mouvements */}
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
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
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
                                                {mov.movement_type === 'adjustment' && (
                                                    <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs font-medium border border-purple-200">Ajustement</span>
                                                )}
                                                {!['in_from_supplier', 'transfer_to_shop', 'adjustment'].includes(mov.movement_type) && (
                                                    <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded text-xs font-medium border border-gray-200">{mov.movement_type}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={parseFloat(mov.quantity) > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {parseFloat(mov.quantity) > 0 ? '+' : ''}{Number(mov.quantity)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {Number(mov.stock_before)} → {Number(mov.stock_after)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate">
                                                {mov.notes}
                                                {mov.destination_company_name && (
                                                    <div className="text-brand-600 mt-1">
                                                        Vers: {mov.destination_company_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {mov.movement_type === 'transfer_to_shop' && mov.is_cancelled !== 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setCancelModalMovement(mov)}
                                                    >
                                                        <XCircle size={14} className="mr-1" />
                                                        Annuler
                                                    </Button>
                                                )}
                                                {mov.movement_type === 'transfer_to_shop' && mov.is_cancelled === 1 && (
                                                    <span className="text-xs text-gray-400 italic">Annulé</span>
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

            {/* Contenu - Ajustements */}
            {activeTab === 'adjustments' && (
                <div className="space-y-4">
                    {/* Filtres */}
                    {/* <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Date début</label>
                                <Input
                                    type="date"
                                    value={adjustmentFilter.start_date}
                                    onChange={(e) => setAdjustmentFilter({ ...adjustmentFilter, start_date: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Date fin</label>
                                <Input
                                    type="date"
                                    value={adjustmentFilter.end_date}
                                    onChange={(e) => setAdjustmentFilter({ ...adjustmentFilter, end_date: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Motif</label>
                                <Select
                                    value={adjustmentFilter.reason}
                                    onValueChange={(value) => setAdjustmentFilter({ ...adjustmentFilter, reason: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tous les motifs" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les motifs</SelectItem>
                                        <SelectItem value="STOCK_INITIAL">Stock initial</SelectItem>
                                        <SelectItem value="INVENTORY_COUNT">Inventaire physique</SelectItem>
                                        <SelectItem value="DAMAGED">Produit endommagé</SelectItem>
                                        <SelectItem value="EXPIRED">Produit périmé</SelectItem>
                                        <SelectItem value="LOST">Perte / Vol</SelectItem>
                                        <SelectItem value="FOUND">Produit retrouvé</SelectItem>
                                        <SelectItem value="RETURN">Retour produit</SelectItem>
                                        <SelectItem value="SAMPLE">Échantillon</SelectItem>
                                        <SelectItem value="GIFT">Cadeau / Don</SelectItem>
                                        <SelectItem value="TRANSFER_ERROR">Erreur de transfert</SelectItem>
                                        <SelectItem value="MANUAL_CORRECTION">Correction manuelle</SelectItem>
                                        <SelectItem value="OTHER">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleAdjustmentFilter} className="w-full">
                                    <Filter size={16} className="mr-2" />
                                    Filtrer
                                </Button>
                                <Button variant="outline" onClick={resetAdjustmentFilter} className="w-full">
                                    Réinitialiser
                                </Button>
                            </div>
                        </div>
                    </div> */}

                    {/* Liste des ajustements */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-sm text-gray-500">
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium">Produit</th>
                                        <th className="px-6 py-4 font-medium">Motif</th>
                                        <th className="px-6 py-4 font-medium">Quantité</th>
                                        <th className="px-6 py-4 font-medium">Avant/Après</th>
                                        <th className="px-6 py-4 font-medium">Effectué par</th>
                                        <th className="px-6 py-4 font-medium">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {adjustments.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                Aucun ajustement enregistré.
                                            </td>
                                        </tr>
                                    ) : (
                                        adjustments.map((adj) => {
                                            // Extraire le motif depuis les notes
                                            const reasonMatch = adj.notes?.match(/\[([^\]]+)\]/);
                                            const reason = reasonMatch ? reasonMatch[1] : 'Autre';
                                            const cleanNotes = adj.notes?.replace(/\[([^\]]+)\]\s*/, '') || '';

                                            return (
                                                <tr key={adj.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                        {new Date(adj.created_at).toLocaleString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {adj.product_name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {reason}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={parseFloat(adj.quantity) > 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {parseFloat(adj.quantity) > 0 ? '+' : ''}{Number(adj.quantity)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {Number(adj.stock_before)} → {Number(adj.stock_after)}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {adj.first_name} {adj.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate">
                                                        {cleanNotes || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <div className="text-sm text-gray-500">
                                    Page {pagination.page} sur {pagination.pages} ({pagination.total} résultats)
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page <= 1}
                                        onClick={() => setAdjustmentPage(pagination.page - 1)}
                                    >
                                        Précédent
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page >= pagination.pages}
                                        onClick={() => setAdjustmentPage(pagination.page + 1)}
                                    >
                                        Suivant
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <TransferModal
                isOpen={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                stock={selectedProduct}
                warehouseId={id}
            />

            <AdjustStockModal
                isOpen={adjustModalOpen}
                onClose={() => setAdjustModalOpen(false)}
                stock={selectedProduct}
                warehouseId={id}
                onSuccess={() => {
                    // Rafraîchir les données
                    fetchWarehouseStocks(id);
                    fetchWarehouseAdjustments(id, { page: adjustmentPage, limit: 50 });
                }}
            />
            
            <CancelTransferModal
                isOpen={!!cancelModalMovement}
                onClose={() => setCancelModalMovement(null)}
                movement={cancelModalMovement}
                onSuccess={() => {
                    fetchWarehouseStocks(id);
                    fetchWarehouseMovements(id);
                }}
            />
        </div>
    );
}