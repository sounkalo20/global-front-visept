'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRightLeft,
    Package,
    History,
    Plus,
    Filter,
    Calendar,
    XCircle,
    Search,
    X,
    ArrowUpDown,
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
    Boxes
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

    // ─── FILTRES STOCKS ───
    const [stockSearch, setStockSearch] = useState('');
    const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'
    const [stockSortBy, setStockSortBy] = useState('name_asc'); // 'name_asc' | 'name_desc' | 'qty_desc' | 'qty_asc'

    // ─── FILTRES MOUVEMENTS ───
    const [movementSearch, setMovementSearch] = useState('');
    const [movementTypeFilter, setMovementTypeFilter] = useState('all'); // 'all' | 'in_from_supplier' | 'transfer_to_shop' | 'adjustment'
    const [movementStatusFilter, setMovementStatusFilter] = useState('all'); // 'all' | 'active' | 'cancelled'
    const [movementStartDate, setMovementStartDate] = useState('');
    const [movementEndDate, setMovementEndDate] = useState('');
    const [movementSortBy, setMovementSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'qty_desc' | 'qty_asc'

    // ─── FILTRES AJUSTEMENTS ───
    const [adjustmentSearch, setAdjustmentSearch] = useState('');
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

    // ─── CALCULS STATISTIQUES ───
    const stats = useMemo(() => {
        const totalItems = stocks ? stocks.length : 0;
        let totalQuantity = 0;
        let outOfStockCount = 0;
        let inStockCount = 0;

        (stocks || []).forEach(s => {
            const qty = parseFloat(s.quantity) || 0;
            if (qty > 0) {
                totalQuantity += qty;
                inStockCount += 1;
            } else {
                outOfStockCount += 1;
            }
        });

        const totalMovementsCount = movements ? movements.length : 0;

        return {
            totalItems,
            totalQuantity,
            inStockCount,
            outOfStockCount,
            totalMovementsCount
        };
    }, [stocks, movements]);

    // ─── FILTRAGE DES STOCKS ───
    const filteredStocks = useMemo(() => {
        if (!stocks) return [];
        return stocks
            .filter((item) => {
                // Recherche texte (nom de produit ou code-barres / sku)
                if (stockSearch.trim()) {
                    const q = stockSearch.toLowerCase().trim();
                    const nameMatch = item.product_name?.toLowerCase().includes(q);
                    const skuMatch = item.sku?.toLowerCase().includes(q);
                    if (!nameMatch && !skuMatch) return false;
                }
                // Filtre de stock
                const qty = parseFloat(item.quantity) || 0;
                if (stockStatusFilter === 'in_stock' && qty <= 0) return false;
                if (stockStatusFilter === 'out_of_stock' && qty > 0) return false;

                return true;
            })
            .sort((a, b) => {
                if (stockSortBy === 'name_asc') {
                    return (a.product_name || '').localeCompare(b.product_name || '');
                }
                if (stockSortBy === 'name_desc') {
                    return (b.product_name || '').localeCompare(a.product_name || '');
                }
                if (stockSortBy === 'qty_desc') {
                    return (parseFloat(b.quantity) || 0) - (parseFloat(a.quantity) || 0);
                }
                if (stockSortBy === 'qty_asc') {
                    return (parseFloat(a.quantity) || 0) - (parseFloat(b.quantity) || 0);
                }
                return 0;
            });
    }, [stocks, stockSearch, stockStatusFilter, stockSortBy]);

    const hasActiveStockFilters = stockSearch.trim() !== '' || stockStatusFilter !== 'all' || stockSortBy !== 'name_asc';

    const resetStockFilters = () => {
        setStockSearch('');
        setStockStatusFilter('all');
        setStockSortBy('name_asc');
    };

    // ─── FILTRAGE DES MOUVEMENTS ───
    const filteredMovements = useMemo(() => {
        if (!movements) return [];
        return movements
            .filter((mov) => {
                // Recherche texte
                if (movementSearch.trim()) {
                    const q = movementSearch.toLowerCase().trim();
                    const nameMatch = mov.product_name?.toLowerCase().includes(q);
                    const notesMatch = mov.notes?.toLowerCase().includes(q);
                    const destMatch = mov.destination_company_name?.toLowerCase().includes(q);
                    if (!nameMatch && !notesMatch && !destMatch) return false;
                }
                // Type de mouvement
                if (movementTypeFilter !== 'all' && mov.movement_type !== movementTypeFilter) {
                    return false;
                }
                // Statut (Annulé ou actif)
                if (movementStatusFilter === 'active' && mov.is_cancelled === 1) return false;
                if (movementStatusFilter === 'cancelled' && mov.is_cancelled !== 1) return false;

                // Dates
                if (movementStartDate) {
                    const movDate = new Date(mov.created_at);
                    const start = new Date(movementStartDate);
                    start.setHours(0, 0, 0, 0);
                    if (movDate < start) return false;
                }
                if (movementEndDate) {
                    const movDate = new Date(mov.created_at);
                    const end = new Date(movementEndDate);
                    end.setHours(23, 59, 59, 999);
                    if (movDate > end) return false;
                }

                return true;
            })
            .sort((a, b) => {
                if (movementSortBy === 'date_desc') {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                if (movementSortBy === 'date_asc') {
                    return new Date(a.created_at) - new Date(b.created_at);
                }
                if (movementSortBy === 'qty_desc') {
                    return (parseFloat(b.quantity) || 0) - (parseFloat(a.quantity) || 0);
                }
                if (movementSortBy === 'qty_asc') {
                    return (parseFloat(a.quantity) || 0) - (parseFloat(b.quantity) || 0);
                }
                return 0;
            });
    }, [movements, movementSearch, movementTypeFilter, movementStatusFilter, movementStartDate, movementEndDate, movementSortBy]);

    const hasActiveMovementFilters =
        movementSearch.trim() !== '' ||
        movementTypeFilter !== 'all' ||
        movementStatusFilter !== 'all' ||
        movementStartDate !== '' ||
        movementEndDate !== '' ||
        movementSortBy !== 'date_desc';

    const resetMovementFilters = () => {
        setMovementSearch('');
        setMovementTypeFilter('all');
        setMovementStatusFilter('all');
        setMovementStartDate('');
        setMovementEndDate('');
        setMovementSortBy('date_desc');
    };

    // ─── FILTRAGE DES AJUSTEMENTS ───
    const filteredAdjustments = useMemo(() => {
        if (!adjustments) return [];
        return adjustments.filter((adj) => {
            if (!adjustmentSearch.trim()) return true;
            const q = adjustmentSearch.toLowerCase().trim();
            const prodMatch = adj.product_name?.toLowerCase().includes(q);
            const userMatch = `${adj.first_name || ''} ${adj.last_name || ''}`.toLowerCase().includes(q);
            const notesMatch = adj.notes?.toLowerCase().includes(q);
            return prodMatch || userMatch || notesMatch;
        });
    }, [adjustments, adjustmentSearch]);

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
        setAdjustmentSearch('');
        fetchWarehouseAdjustments(id, { page: 1, limit: 50 });
        setAdjustmentPage(1);
    };

    if (isLoading && !currentWarehouse) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
                    <p className="text-sm text-gray-500 font-medium">Chargement des données de l'entrepôt...</p>
                </div>
            </div>
        );
    }

    if (!currentWarehouse) return null;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/shop/warehouses')}
                        className="p-2.5 bg-white border rounded-xl hover:bg-gray-50 text-gray-600 hover:text-gray-900 shadow-sm transition-all"
                        title="Retour aux entrepôts"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{currentWarehouse.name}</h1>
                            <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-200">
                                Entrepôt actif
                            </Badge>
                        </div>
                        {currentWarehouse.address && (
                            <p className="text-sm text-gray-500 mt-1">{currentWarehouse.address}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {activeTab === 'stocks' && (
                        <ExportWarehouseStockPDFButton warehouseId={id} warehouseName={currentWarehouse.name} />
                    )}
                    {activeTab === 'movements' && (
                        <ExportWarehouseHistoryPDFDialog warehouseId={id} warehouseName={currentWarehouse.name} />
                    )}
                </div>
            </div>

            {/* Cartes statistiques rapides */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Références</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalItems}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Boxes size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unités en stock</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalQuantity.toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                        <Package size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">En rupture</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStockCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <AlertTriangle size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mouvements</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">{stats.totalMovementsCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <History size={20} />
                    </div>
                </div>
            </div>

            {/* Onglets */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('stocks')}
                    className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
                        activeTab === 'stocks'
                            ? 'border-brand-600 text-brand-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <Package size={18} />
                    Stock actuel
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                        {filteredStocks.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('movements')}
                    className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
                        activeTab === 'movements'
                            ? 'border-brand-600 text-brand-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <History size={18} />
                    Historique des mouvements
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                        {filteredMovements.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('adjustments')}
                    className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
                        activeTab === 'adjustments'
                            ? 'border-brand-600 text-brand-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    <Filter size={18} />
                    Ajustements
                    {pagination && (
                        <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                            {pagination.total || adjustments.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* CONTENU : STOCKS                                             */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'stocks' && (
                <div className="space-y-4">
                    {/* Barre de recherche et Zone de filtres pour Stocks */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Barre de recherche */}
                            <div className="relative flex-1">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Rechercher par nom de produit, SKU ou code-barres..."
                                    value={stockSearch}
                                    onChange={(e) => setStockSearch(e.target.value)}
                                    className="pl-10 pr-10 h-10 rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500 text-sm"
                                />
                                {stockSearch && (
                                    <button
                                        onClick={() => setStockSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        title="Effacer la recherche"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Filtres de statut de stock */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                    onClick={() => setStockStatusFilter('all')}
                                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                                        stockStatusFilter === 'all'
                                            ? 'bg-brand-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Tous ({stocks ? stocks.length : 0})
                                </button>
                                <button
                                    onClick={() => setStockStatusFilter('in_stock')}
                                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                                        stockStatusFilter === 'in_stock'
                                            ? 'bg-green-600 text-white shadow-sm'
                                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                    }`}
                                >
                                    <CheckCircle2 size={14} />
                                    En stock ({stats.inStockCount})
                                </button>
                                <button
                                    onClick={() => setStockStatusFilter('out_of_stock')}
                                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                                        stockStatusFilter === 'out_of_stock'
                                            ? 'bg-red-600 text-white shadow-sm'
                                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                    }`}
                                >
                                    <AlertTriangle size={14} />
                                    En rupture ({stats.outOfStockCount})
                                </button>

                                {/* Sélecteur de Tri */}
                                <Select value={stockSortBy} onValueChange={setStockSortBy}>
                                    <SelectTrigger className="w-[170px] h-10 text-xs border-gray-300">
                                        <div className="flex items-center gap-1.5 text-gray-700">
                                            <ArrowUpDown size={14} className="text-gray-400" />
                                            <SelectValue placeholder="Trier par" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name_asc">Nom (A → Z)</SelectItem>
                                        <SelectItem value="name_desc">Nom (Z → A)</SelectItem>
                                        <SelectItem value="qty_desc">Quantité (Plus élevée)</SelectItem>
                                        <SelectItem value="qty_asc">Quantité (Plus faible)</SelectItem>
                                    </SelectContent>
                                </Select>

                                {hasActiveStockFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetStockFilters}
                                        className="h-10 px-3 text-xs text-gray-500 hover:text-gray-900"
                                    >
                                        <RotateCcw size={14} className="mr-1.5" />
                                        Réinitialiser
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Indication du nombre de résultats si filtré */}
                        {hasActiveStockFilters && (
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                                <span>
                                    Affichage de <strong className="text-gray-900 font-semibold">{filteredStocks.length}</strong> sur <strong className="text-gray-900 font-semibold">{stocks.length}</strong> produit(s)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tableau des stocks */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                        <th className="px-6 py-4">Produit</th>
                                        <th className="px-6 py-4">SKU / Code-barres</th>
                                        <th className="px-6 py-4">Quantité en entrepôt</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {filteredStocks.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Package className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {hasActiveStockFilters
                                                            ? 'Aucun produit ne correspond à vos filtres de recherche.'
                                                            : 'Aucun stock dans cet entrepôt.'}
                                                    </p>
                                                    {hasActiveStockFilters && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={resetStockFilters}
                                                            className="mt-2 text-xs"
                                                        >
                                                            <RotateCcw size={12} className="mr-1" />
                                                            Effacer les filtres
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStocks.map((stock) => {
                                            const qty = parseFloat(stock.quantity) || 0;
                                            return (
                                                <tr key={stock.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900">{stock.product_name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {stock.sku ? (
                                                            <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                                                {stock.sku}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                qty > 0
                                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                                            }`}
                                                        >
                                                            {qty > 0 ? (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                                            ) : (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                                                            )}
                                                            {Number(stock.quantity)} unité{qty > 1 ? 's' : ''}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAdjust(stock)}
                                                            className="text-xs hover:border-brand-500 hover:text-brand-600"
                                                        >
                                                            <Plus size={14} className="mr-1 text-brand-600" />
                                                            Ajuster
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={qty <= 0}
                                                            onClick={() => handleTransfer(stock)}
                                                            className="text-xs hover:border-blue-500 hover:text-blue-600"
                                                        >
                                                            <ArrowRightLeft size={14} className="mr-1 text-blue-600" />
                                                            Transférer
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* CONTENU : HISTORIQUE DES MOUVEMENTS                          */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'movements' && (
                <div className="space-y-4">
                    {/* Barre de recherche et Zone de filtres pour Historique */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Recherche textuelle */}
                            <div className="relative lg:col-span-2">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Rechercher par produit, notes, destination..."
                                    value={movementSearch}
                                    onChange={(e) => setMovementSearch(e.target.value)}
                                    className="pl-10 pr-10 h-10 rounded-lg border-gray-300 text-sm"
                                />
                                {movementSearch && (
                                    <button
                                        onClick={() => setMovementSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        title="Effacer la recherche"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Type de mouvement */}
                            <div>
                                <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                                    <SelectTrigger className="h-10 text-xs border-gray-300">
                                        <SelectValue placeholder="Type de mouvement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les types</SelectItem>
                                        <SelectItem value="in_from_supplier">Entrée (Fournisseur)</SelectItem>
                                        <SelectItem value="transfer_to_shop">Transfert (Boutique)</SelectItem>
                                        <SelectItem value="adjustment">Ajustement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Statut Transfert */}
                            <div>
                                <Select value={movementStatusFilter} onValueChange={setMovementStatusFilter}>
                                    <SelectTrigger className="h-10 text-xs border-gray-300">
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="active">Actifs (Non annulés)</SelectItem>
                                        <SelectItem value="cancelled">Annulés uniquement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tri */}
                            <div>
                                <Select value={movementSortBy} onValueChange={setMovementSortBy}>
                                    <SelectTrigger className="h-10 text-xs border-gray-300">
                                        <div className="flex items-center gap-1.5 text-gray-700">
                                            <ArrowUpDown size={14} className="text-gray-400" />
                                            <SelectValue placeholder="Trier par" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date_desc">Date (Plus récent)</SelectItem>
                                        <SelectItem value="date_asc">Date (Plus ancien)</SelectItem>
                                        <SelectItem value="qty_desc">Quantité (+ élevée)</SelectItem>
                                        <SelectItem value="qty_asc">Quantité (- faible)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Deuxième ligne : Filtre par dates */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                        <Calendar size={14} className="text-gray-400" />
                                        Du:
                                    </span>
                                    <Input
                                        type="date"
                                        value={movementStartDate}
                                        onChange={(e) => setMovementStartDate(e.target.value)}
                                        className="w-36 h-8 text-xs rounded-lg border-gray-300"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600">Au:</span>
                                    <Input
                                        type="date"
                                        value={movementEndDate}
                                        onChange={(e) => setMovementEndDate(e.target.value)}
                                        className="w-36 h-8 text-xs rounded-lg border-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                {hasActiveMovementFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetMovementFilters}
                                        className="h-8 px-3 text-xs text-gray-500 hover:text-gray-900"
                                    >
                                        <RotateCcw size={14} className="mr-1.5" />
                                        Réinitialiser
                                    </Button>
                                )}
                                <span className="text-xs text-gray-500">
                                    <strong className="text-gray-900 font-semibold">{filteredMovements.length}</strong> sur <strong className="text-gray-900 font-semibold">{movements.length}</strong> mouvement(s)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tableau des mouvements */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Produit</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Quantité</th>
                                        <th className="px-6 py-4">Avant / Après</th>
                                        <th className="px-6 py-4">Notes & Destination</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {filteredMovements.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <History className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {hasActiveMovementFilters
                                                            ? 'Aucun mouvement ne correspond à vos filtres.'
                                                            : 'Aucun mouvement enregistré.'}
                                                    </p>
                                                    {hasActiveMovementFilters && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={resetMovementFilters}
                                                            className="mt-2 text-xs"
                                                        >
                                                            <RotateCcw size={12} className="mr-1" />
                                                            Effacer les filtres
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMovements.map((mov) => {
                                            const qty = parseFloat(mov.quantity) || 0;
                                            return (
                                                <tr key={mov.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                                                        {new Date(mov.created_at).toLocaleString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                                        {mov.product_name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {mov.movement_type === 'in_from_supplier' && (
                                                            <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200 inline-flex items-center gap-1">
                                                                Entrée (Fournisseur)
                                                            </span>
                                                        )}
                                                        {mov.movement_type === 'transfer_to_shop' && (
                                                            <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-blue-200 inline-flex items-center gap-1">
                                                                Transfert (Boutique)
                                                            </span>
                                                        )}
                                                        {mov.movement_type === 'adjustment' && (
                                                            <span className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-200 inline-flex items-center gap-1">
                                                                Ajustement
                                                            </span>
                                                        )}
                                                        {!['in_from_supplier', 'transfer_to_shop', 'adjustment'].includes(mov.movement_type) && (
                                                            <span className="text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200">
                                                                {mov.movement_type}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold">
                                                        <span className={qty > 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {qty > 0 ? '+' : ''}{Number(mov.quantity)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                                        {Number(mov.stock_before)} → <span className="font-semibold text-gray-800">{Number(mov.stock_after)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-xs">
                                                        <div className="truncate">{mov.notes || '-'}</div>
                                                        {mov.destination_company_name && (
                                                            <div className="text-brand-600 font-medium mt-0.5 flex items-center gap-1">
                                                                <span>→ Boutique :</span> {mov.destination_company_name}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {mov.movement_type === 'transfer_to_shop' ? (
                                                            mov.is_cancelled === 1 ? (
                                                                <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-medium">
                                                                    Annulé
                                                                </span>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8"
                                                                    onClick={() => setCancelModalMovement(mov)}
                                                                >
                                                                    <XCircle size={14} className="mr-1" />
                                                                    Annuler
                                                                </Button>
                                                            )
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* CONTENU : AJUSTEMENTS                                        */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'adjustments' && (
                <div className="space-y-4">
                    {/* Zone de filtres avancée pour Ajustements */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {/* Recherche textuelle */}
                            <div className="relative lg:col-span-2">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Rechercher par produit, exécuté par, notes..."
                                    value={adjustmentSearch}
                                    onChange={(e) => setAdjustmentSearch(e.target.value)}
                                    className="pl-10 pr-10 h-10 rounded-lg border-gray-300 text-sm"
                                />
                                {adjustmentSearch && (
                                    <button
                                        onClick={() => setAdjustmentSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        title="Effacer la recherche"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Date début */}
                            <div>
                                <Input
                                    type="date"
                                    value={adjustmentFilter.start_date}
                                    onChange={(e) => setAdjustmentFilter({ ...adjustmentFilter, start_date: e.target.value })}
                                    className="w-full h-10 rounded-lg border-gray-300 text-xs"
                                    placeholder="Date début"
                                />
                            </div>

                            {/* Date fin */}
                            <div>
                                <Input
                                    type="date"
                                    value={adjustmentFilter.end_date}
                                    onChange={(e) => setAdjustmentFilter({ ...adjustmentFilter, end_date: e.target.value })}
                                    className="w-full h-10 rounded-lg border-gray-300 text-xs"
                                    placeholder="Date fin"
                                />
                            </div>

                            {/* Motif */}
                            <div>
                                <Select
                                    value={adjustmentFilter.reason}
                                    onValueChange={(value) => setAdjustmentFilter({ ...adjustmentFilter, reason: value })}
                                >
                                    <SelectTrigger className="h-10 text-xs border-gray-300">
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
                        </div>

                        {/* Boutons d'action des filtres */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                                Affichage de <strong className="text-gray-900 font-semibold">{filteredAdjustments.length}</strong> ajustement(s)
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetAdjustmentFilter}
                                    className="text-xs h-8"
                                >
                                    <RotateCcw size={14} className="mr-1.5" />
                                    Réinitialiser
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleAdjustmentFilter}
                                    className="bg-brand-600 hover:bg-brand-700 text-white text-xs h-8"
                                >
                                    <Filter size={14} className="mr-1.5" />
                                    Appliquer les filtres
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Liste des ajustements */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Produit</th>
                                        <th className="px-6 py-4">Motif</th>
                                        <th className="px-6 py-4">Quantité</th>
                                        <th className="px-6 py-4">Avant / Après</th>
                                        <th className="px-6 py-4">Effectué par</th>
                                        <th className="px-6 py-4">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {filteredAdjustments.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Filter className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Aucun ajustement trouvé.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdjustments.map((adj) => {
                                            const reasonMatch = adj.notes?.match(/\[([^\]]+)\]/);
                                            const reason = reasonMatch ? reasonMatch[1] : 'Autre';
                                            const cleanNotes = adj.notes?.replace(/\[([^\]]+)\]\s*/, '') || '';
                                            const qty = parseFloat(adj.quantity) || 0;

                                            return (
                                                <tr key={adj.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                                                        {new Date(adj.created_at).toLocaleString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                                        {adj.product_name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs bg-gray-100 text-gray-800 font-medium px-2.5 py-1 rounded-full border border-gray-200">
                                                            {reason}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold">
                                                        <span className={qty > 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {qty > 0 ? '+' : ''}{Number(adj.quantity)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                                        {Number(adj.stock_before)} → <span className="font-semibold text-gray-800">{Number(adj.stock_after)}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 text-xs font-medium">
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
                            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                                <div className="text-xs text-gray-500">
                                    Page <strong className="font-semibold text-gray-900">{pagination.page}</strong> sur <strong className="font-semibold text-gray-900">{pagination.pages}</strong> ({pagination.total} résultats)
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page <= 1}
                                        onClick={() => setAdjustmentPage(pagination.page - 1)}
                                        className="text-xs h-8"
                                    >
                                        Précédent
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page >= pagination.pages}
                                        onClick={() => setAdjustmentPage(pagination.page + 1)}
                                        className="text-xs h-8"
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