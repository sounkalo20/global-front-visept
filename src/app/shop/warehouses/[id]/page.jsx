'use client';
import { useEffect, useState, useMemo } from 'react';
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
    XCircle,
    Search,
    AlertTriangle,
    Boxes
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
    
    // Filtres
    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState('all');

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
        const params = { page: 1, limit: 50 };
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

    // Derived states
    const filteredStocks = useMemo(() => {
        let result = stocks || [];
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s => 
                (s.product_name && s.product_name.toLowerCase().includes(query)) ||
                (s.sku && s.sku.toLowerCase().includes(query))
            );
        }
        
        if (stockFilter === 'low') {
            result = result.filter(s => parseFloat(s.quantity) > 0 && parseFloat(s.quantity) <= 10); // Simulation seuil critique
        } else if (stockFilter === 'out') {
            result = result.filter(s => parseFloat(s.quantity) <= 0);
        } else if (stockFilter === 'in_stock') {
            result = result.filter(s => parseFloat(s.quantity) > 0);
        }
        
        return result;
    }, [stocks, searchQuery, stockFilter]);

    const stats = useMemo(() => {
        if (!stocks) return { totalProducts: 0, outOfStock: 0, totalItems: 0 };
        return {
            totalProducts: stocks.length,
            outOfStock: stocks.filter(s => parseFloat(s.quantity) <= 0).length,
            totalItems: stocks.reduce((acc, s) => acc + (parseFloat(s.quantity) > 0 ? parseFloat(s.quantity) : 0), 0)
        };
    }, [stocks]);

    if (isLoading && !currentWarehouse) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    if (!currentWarehouse) return null;

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/shop/warehouses')}
                        className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{currentWarehouse.name}</h1>
                        {currentWarehouse.address && (
                            <p className="text-sm text-gray-500 font-medium">{currentWarehouse.address}</p>
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

            {/* KPIs */}
            {activeTab === 'stocks' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Produits</p>
                            <p className="text-2xl font-extrabold text-gray-900">{stats.totalProducts}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                            <Boxes size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Unités en Stock</p>
                            <p className="text-2xl font-extrabold text-gray-900">{stats.totalItems.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ruptures de stock</p>
                            <p className="text-2xl font-extrabold text-red-600">{stats.outOfStock}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Onglets */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab('stocks')}
                    className={`pb-3 px-4 font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'stocks'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Package size={18} />
                    Stock actuel
                </button>
                <button
                    onClick={() => setActiveTab('movements')}
                    className={`pb-3 px-4 font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'movements'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <History size={18} />
                    Historique
                </button>
                <button
                    onClick={() => setActiveTab('adjustments')}
                    className={`pb-3 px-4 font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'adjustments'
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
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/* Filtres & Recherche */}
                    <div className="p-4 border-b bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="Rechercher un produit ou SKU..."
                                className="pl-10 bg-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={stockFilter} onValueChange={setStockFilter}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Filtrer l'état" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les produits</SelectItem>
                                    <SelectItem value="in_stock">En stock</SelectItem>
                                    <SelectItem value="low">Stock faible</SelectItem>
                                    <SelectItem value="out">En rupture</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b text-sm text-gray-500">
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Produit</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">SKU/Code-barres</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Quantité en entrepôt</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {filteredStocks.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <Package size={32} className="mx-auto text-gray-300 mb-3" />
                                            <p className="font-medium text-gray-900">Aucun produit trouvé</p>
                                            <p className="text-sm">Essayez de modifier vos filtres de recherche.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStocks.map((stock) => (
                                        <tr key={stock.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{stock.product_name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                {stock.sku || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${parseFloat(stock.quantity) > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                                                    }`}>
                                                    {Number(stock.quantity)} Unités
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-gray-200 hover:bg-gray-100"
                                                    onClick={() => handleAdjust(stock)}
                                                >
                                                    <Plus size={14} className="mr-1" />
                                                    Ajuster
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-gray-200 hover:bg-gray-100"
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
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b text-sm text-gray-500">
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Produit</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Quantité</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Avant/Après</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Notes</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Actions</th>
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
                                            <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                                                {new Date(mov.created_at).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {mov.product_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {mov.movement_type === 'in_from_supplier' && (
                                                    <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-md text-xs font-bold border border-green-200">Entrée (Fournisseur)</span>
                                                )}
                                                {mov.movement_type === 'transfer_to_shop' && (
                                                    <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200">Transfert (Boutique)</span>
                                                )}
                                                {mov.movement_type === 'adjustment' && (
                                                    <span className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md text-xs font-bold border border-purple-200">Ajustement</span>
                                                )}
                                                {!['in_from_supplier', 'transfer_to_shop', 'adjustment'].includes(mov.movement_type) && (
                                                    <span className="text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200">{mov.movement_type}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                <span className={parseFloat(mov.quantity) > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {parseFloat(mov.quantity) > 0 ? '+' : ''}{Number(mov.quantity)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                {Number(mov.stock_before)} → {Number(mov.stock_after)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate font-medium">
                                                {mov.notes}
                                                {mov.destination_company_name && (
                                                    <div className="text-brand-600 mt-1 font-bold">
                                                        Vers: {mov.destination_company_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {mov.movement_type === 'transfer_to_shop' && mov.is_cancelled !== 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                                                        onClick={() => setCancelModalMovement(mov)}
                                                    >
                                                        <XCircle size={14} className="mr-1" />
                                                        Annuler
                                                    </Button>
                                                )}
                                                {mov.movement_type === 'transfer_to_shop' && mov.is_cancelled === 1 && (
                                                    <span className="text-xs text-gray-400 italic font-bold">Annulé</span>
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
                    {/* Liste des ajustements */}
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-sm text-gray-500">
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider">Produit</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider">Motif</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider">Quantité</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider">Avant/Après</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider">Effectué par</th>
                                        <th className="px-6 py-4 font-bold uppercase tracking-wider">Notes</th>
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
                                            const reasonMatch = adj.notes?.match(/\[([^\]]+)\]/);
                                            const reason = reasonMatch ? reasonMatch[1] : 'Autre';
                                            const cleanNotes = adj.notes?.replace(/\[([^\]]+)\]\s*/, '') || '';

                                            return (
                                                <tr key={adj.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                                                        {new Date(adj.created_at).toLocaleString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900">
                                                        {adj.product_name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                                                            {reason}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold">
                                                        <span className={parseFloat(adj.quantity) > 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {parseFloat(adj.quantity) > 0 ? '+' : ''}{Number(adj.quantity)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                                        {Number(adj.stock_before)} → {Number(adj.stock_after)}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 font-medium">
                                                        {adj.first_name} {adj.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate font-medium">
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
                            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                                <div className="text-sm font-bold text-gray-500">
                                    Page {pagination.page} sur {pagination.pages} ({pagination.total} résultats)
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="font-bold"
                                        disabled={pagination.page <= 1}
                                        onClick={() => setAdjustmentPage(pagination.page - 1)}
                                    >
                                        Précédent
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="font-bold"
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