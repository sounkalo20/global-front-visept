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
    AlertTriangle,
    X,
    RotateCcw,
    CheckCircle2,
    Boxes,
    SlidersHorizontal,
    User,
    ArrowUpDown,
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

// Helper pour décoder les motifs des ajustements
const parseAdjustmentNote = (notes) => {
    if (!notes) return { reasonCode: 'other', reasonLabel: 'Autre motif', cleanNotes: '-' };
    const match = notes.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
        const rawCode = match[1];
        const reasonsMap = {
            inventory_count: 'Inventaire physique',
            damage: 'Produit endommagé / Casse',
            theft: 'Vol / Perte',
            loss: 'Péremption / Perte',
            supplier_correction: 'Correction fournisseur',
            correction: 'Correction de saisie',
            other: 'Autre motif',
        };
        return {
            reasonCode: rawCode,
            reasonLabel: reasonsMap[rawCode] || rawCode,
            cleanNotes: match[2] || '-',
        };
    }
    return { reasonCode: 'adjustment', reasonLabel: 'Ajustement', cleanNotes: notes };
};

export default function WarehouseDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const {
        currentWarehouse,
        stocks,
        movements,
        adjustments,
        adjustmentReasons,
        pagination,
        getWarehouseById,
        fetchWarehouseStocks,
        fetchWarehouseMovements,
        fetchWarehouseAdjustments,
        fetchAdjustmentReasons,
        isLoading,
    } = useWarehouseStore();

    const [activeTab, setActiveTab] = useState('stocks'); // 'stocks' | 'movements' | 'adjustments'
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cancelModalMovement, setCancelModalMovement] = useState(null);

    // ─── FILTRES STOCKS ───
    const [stockSearch, setStockSearch] = useState('');
    const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'in_stock' | 'low' | 'out_of_stock'
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
        reason: 'all',
    });
    const [adjustmentPage, setAdjustmentPage] = useState(1);

    // Chargement initial
    useEffect(() => {
        if (id) {
            getWarehouseById(id);
            fetchWarehouseStocks(id);
            fetchWarehouseMovements(id);
            fetchWarehouseAdjustments(id, { page: adjustmentPage, limit: 50 });
            fetchAdjustmentReasons();
        }
    }, [id, adjustmentPage]);

    // ─── CALCULS STATISTIQUES (KPIS) ───
    const stats = useMemo(() => {
        const totalProducts = stocks ? stocks.length : 0;
        let totalItems = 0;
        let outOfStock = 0;
        let lowStock = 0;
        let inStockCount = 0;

        (stocks || []).forEach((s) => {
            const qty = parseFloat(s.quantity) || 0;
            if (qty > 0) {
                totalItems += qty;
                inStockCount += 1;
                if (qty <= 10) lowStock += 1;
            } else {
                outOfStock += 1;
            }
        });

        const totalMovementsCount = movements ? movements.length : 0;
        const totalAdjustmentsCount = pagination?.total || (adjustments ? adjustments.length : 0);

        return {
            totalProducts,
            totalItems,
            inStockCount,
            outOfStock,
            lowStock,
            totalMovementsCount,
            totalAdjustmentsCount,
        };
    }, [stocks, movements, adjustments, pagination]);

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
                if (stockStatusFilter === 'low' && (qty <= 0 || qty > 10)) return false;
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

    const hasActiveStockFilters =
        stockSearch.trim() !== '' || stockStatusFilter !== 'all' || stockSortBy !== 'name_asc';

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
    }, [
        movements,
        movementSearch,
        movementTypeFilter,
        movementStatusFilter,
        movementStartDate,
        movementEndDate,
        movementSortBy,
    ]);

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

    const handleApplyAdjustmentFilters = () => {
        const params = { page: 1, limit: 50 };
        if (adjustmentFilter.start_date) params.start_date = adjustmentFilter.start_date;
        if (adjustmentFilter.end_date) params.end_date = adjustmentFilter.end_date;
        if (adjustmentFilter.reason && adjustmentFilter.reason !== 'all') {
            params.reason = adjustmentFilter.reason;
        }
        fetchWarehouseAdjustments(id, params);
        setAdjustmentPage(1);
    };

    const resetAdjustmentFilters = () => {
        setAdjustmentFilter({ start_date: '', end_date: '', reason: 'all' });
        setAdjustmentSearch('');
        fetchWarehouseAdjustments(id, { page: 1, limit: 50 });
        setAdjustmentPage(1);
    };

    const hasActiveAdjustmentFilters =
        adjustmentSearch.trim() !== '' ||
        adjustmentFilter.start_date !== '' ||
        adjustmentFilter.end_date !== '' ||
        adjustmentFilter.reason !== 'all';

    // Actions
    const handleTransfer = (stock) => {
        setSelectedProduct(stock);
        setTransferModalOpen(true);
    };

    const handleAdjust = (stock) => {
        setSelectedProduct(stock);
        setAdjustModalOpen(true);
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
        <div className="p-4 md:p-6 space-y-6 bg-gray-50/50 min-h-screen">
            {/* ═════════════════════════════════════════════════════════════ */}
            {/* EN-TÊTE DE L'ENTREPÔT                                         */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/shop/warehouses')}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                        title="Retour aux entrepôts"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                {currentWarehouse.name}
                            </h1>
                            <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-200 text-xs font-semibold">
                                Entrepôt Central
                            </Badge>
                        </div>
                        {currentWarehouse.address && (
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{currentWarehouse.address}</p>
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

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* CARTES STATISTIQUES / KPIS                                    */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Références</p>
                        <p className="text-2xl font-extrabold text-gray-900">{stats.totalProducts}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{stats.inStockCount} en stock</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <Boxes size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Unités</p>
                        <p className="text-2xl font-extrabold text-green-600">{stats.totalItems.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-500 font-medium">Quantité cumulée</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ruptures de stock</p>
                        <p className="text-2xl font-extrabold text-red-600">{stats.outOfStock}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{stats.lowStock} stock(s) faible(s)</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <History size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mouvements & Ajust.</p>
                        <p className="text-2xl font-extrabold text-purple-600">
                            {stats.totalMovementsCount + stats.totalAdjustmentsCount}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">{stats.totalMovementsCount} mvts / {stats.totalAdjustmentsCount} ajust.</p>
                    </div>
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* ONGLETS DE NAVIGATION                                         */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('stocks')}
                    className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                        activeTab === 'stocks'
                            ? 'border-brand-600 text-brand-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Package size={18} />
                    Stock actuel
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">
                        {filteredStocks.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('movements')}
                    className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                        activeTab === 'movements'
                            ? 'border-brand-600 text-brand-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <History size={18} />
                    Historique des mouvements
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">
                        {filteredMovements.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab('adjustments')}
                    className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                        activeTab === 'adjustments'
                            ? 'border-brand-600 text-brand-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <SlidersHorizontal size={18} />
                    Ajustements de stock
                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">
                        {pagination?.total || adjustments.length}
                    </span>
                </button>
            </div>

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* CONTENU : STOCKS                                             */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'stocks' && (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/* Filtres & Recherche */}
                    <div className="p-4 border-b bg-gray-50/60 flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Rechercher un produit, SKU, code-barres..."
                                className="pl-9 bg-white text-xs h-9"
                                value={stockSearch}
                                onChange={(e) => setStockSearch(e.target.value)}
                            />
                            {stockSearch && (
                                <button
                                    onClick={() => setStockSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                            <div className="w-full sm:w-44">
                                <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                                    <SelectTrigger className="bg-white text-xs h-9">
                                        <SelectValue placeholder="État du stock" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les états</SelectItem>
                                        <SelectItem value="in_stock">En stock ({'> 0'})</SelectItem>
                                        <SelectItem value="low">Stock faible (≤ 10)</SelectItem>
                                        <SelectItem value="out_of_stock">En rupture (0)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full sm:w-48">
                                <Select value={stockSortBy} onValueChange={setStockSortBy}>
                                    <SelectTrigger className="bg-white text-xs h-9">
                                        <SelectValue placeholder="Trier par" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name_asc">Nom (A → Z)</SelectItem>
                                        <SelectItem value="name_desc">Nom (Z → A)</SelectItem>
                                        <SelectItem value="qty_desc">Quantité (Plus élevée)</SelectItem>
                                        <SelectItem value="qty_asc">Quantité (Plus faible)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {hasActiveStockFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetStockFilters}
                                    className="text-xs text-gray-500 hover:text-gray-900 h-9"
                                >
                                    <RotateCcw size={14} className="mr-1" /> Réinitialiser
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tableau des stocks */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-3.5">Produit</th>
                                    <th className="px-6 py-3.5">Code-barres / SKU</th>
                                    <th className="px-6 py-3.5">Quantité en entrepôt</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {filteredStocks.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <Package size={36} className="mx-auto text-gray-300 mb-2" />
                                            <p className="font-semibold text-gray-800 text-sm">Aucun produit trouvé</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Modifiez vos critères de recherche ou ajoutez des produits à l'entrepôt.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStocks.map((stock) => {
                                        const qty = parseFloat(stock.quantity) || 0;
                                        return (
                                            <tr key={stock.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{stock.product_name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {stock.sku || stock.barcode ? (
                                                        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                            {stock.sku || stock.barcode}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                            qty > 0
                                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                                : 'bg-red-100 text-red-700 border border-red-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`w-2 h-2 rounded-full mr-1.5 ${
                                                                qty > 0 ? 'bg-green-500' : 'bg-red-500'
                                                            }`}
                                                        />
                                                        {Number(stock.quantity)} unité{qty > 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-600 text-xs h-8 font-medium"
                                                        onClick={() => handleAdjust(stock)}
                                                    >
                                                        <Plus size={14} className="mr-1 text-brand-600" />
                                                        Ajuster
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={qty <= 0}
                                                        className="border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 text-xs h-8 font-medium disabled:opacity-50"
                                                        onClick={() => handleTransfer(stock)}
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
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* CONTENU : HISTORIQUE DES MOUVEMENTS                          */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'movements' && (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/* Filtres & Recherche Mouvements */}
                    <div className="p-4 border-b bg-gray-50/60 space-y-3">
                        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    placeholder="Rechercher par produit, note, boutique..."
                                    className="pl-9 bg-white text-xs h-9"
                                    value={movementSearch}
                                    onChange={(e) => setMovementSearch(e.target.value)}
                                />
                                {movementSearch && (
                                    <button
                                        onClick={() => setMovementSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                                <div className="w-full sm:w-44">
                                    <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
                                        <SelectTrigger className="bg-white text-xs h-9">
                                            <SelectValue placeholder="Type de mvt" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les types</SelectItem>
                                            <SelectItem value="in_from_supplier">Entrée (Fournisseur)</SelectItem>
                                            <SelectItem value="transfer_to_shop">Transfert (Boutique)</SelectItem>
                                            <SelectItem value="adjustment">Ajustement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-full sm:w-36">
                                    <Select value={movementStatusFilter} onValueChange={setMovementStatusFilter}>
                                        <SelectTrigger className="bg-white text-xs h-9">
                                            <SelectValue placeholder="Statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les statuts</SelectItem>
                                            <SelectItem value="active">Actifs</SelectItem>
                                            <SelectItem value="cancelled">Annulés</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-full sm:w-44">
                                    <Select value={movementSortBy} onValueChange={setMovementSortBy}>
                                        <SelectTrigger className="bg-white text-xs h-9">
                                            <SelectValue placeholder="Trier par" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="date_desc">Date (Récent en 1er)</SelectItem>
                                            <SelectItem value="date_asc">Date (Ancien en 1er)</SelectItem>
                                            <SelectItem value="qty_desc">Quantité (Décroissant)</SelectItem>
                                            <SelectItem value="qty_asc">Quantité (Croissant)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Filtre Date range & Reset */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400" />
                                <span>Du :</span>
                                <Input
                                    type="date"
                                    className="bg-white h-8 text-xs w-36"
                                    value={movementStartDate}
                                    onChange={(e) => setMovementStartDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span>Au :</span>
                                <Input
                                    type="date"
                                    className="bg-white h-8 text-xs w-36"
                                    value={movementEndDate}
                                    onChange={(e) => setMovementEndDate(e.target.value)}
                                />
                            </div>

                            {hasActiveMovementFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetMovementFilters}
                                    className="text-xs text-gray-500 hover:text-gray-900 h-8 ml-auto"
                                >
                                    <RotateCcw size={13} className="mr-1" /> Réinitialiser les filtres
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tableau des mouvements */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-3.5">Date</th>
                                    <th className="px-6 py-3.5">Produit</th>
                                    <th className="px-6 py-3.5">Type</th>
                                    <th className="px-6 py-3.5">Quantité</th>
                                    <th className="px-6 py-3.5">Avant → Après</th>
                                    <th className="px-6 py-3.5">Notes & Destination</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-sm">
                                {filteredMovements.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            <History size={36} className="mx-auto text-gray-300 mb-2" />
                                            <p className="font-semibold text-gray-800 text-sm">Aucun mouvement trouvé</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Aucune entrée, sortie ou transfert correspondant à ces critères.
                                            </p>
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
                                                    {!['in_from_supplier', 'transfer_to_shop', 'adjustment'].includes(
                                                        mov.movement_type
                                                    ) && (
                                                        <span className="text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200">
                                                            {mov.movement_type}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    <span className={qty > 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {qty > 0 ? '+' : ''}
                                                        {Number(mov.quantity)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                                    {Number(mov.stock_before)} →{' '}
                                                    <span className="font-semibold text-gray-800">
                                                        {Number(mov.stock_after)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs max-w-xs">
                                                    <div className="truncate">{mov.notes || '-'}</div>
                                                    {mov.destination_company_name && (
                                                        <div className="text-brand-600 font-semibold mt-0.5 flex items-center gap-1">
                                                            <span>→ Boutique :</span> {mov.destination_company_name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {mov.movement_type === 'transfer_to_shop' ? (
                                                        mov.is_cancelled === 1 ? (
                                                            <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-semibold">
                                                                Annulé
                                                            </span>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8 font-semibold"
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
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* CONTENU : AJUSTEMENTS                                        */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {activeTab === 'adjustments' && (
                <div className="space-y-4">
                    {/* Filtres Ajustements */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Rechercher par produit, motif, agent..."
                                className="pl-9 bg-white text-xs h-9"
                                value={adjustmentSearch}
                                onChange={(e) => setAdjustmentSearch(e.target.value)}
                            />
                            {adjustmentSearch && (
                                <button
                                    onClick={() => setAdjustmentSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                            <div className="w-full sm:w-48">
                                <Select
                                    value={adjustmentFilter.reason}
                                    onValueChange={(val) => setAdjustmentFilter((prev) => ({ ...prev, reason: val }))}
                                >
                                    <SelectTrigger className="bg-white text-xs h-9">
                                        <SelectValue placeholder="Motif d'ajustement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les motifs</SelectItem>
                                        <SelectItem value="inventory_count">Inventaire physique</SelectItem>
                                        <SelectItem value="damage">Produit endommagé</SelectItem>
                                        <SelectItem value="theft">Vol / Perte</SelectItem>
                                        <SelectItem value="loss">Péremption</SelectItem>
                                        <SelectItem value="supplier_correction">Correction fournisseur</SelectItem>
                                        <SelectItem value="other">Autre motif</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleApplyAdjustmentFilters}
                                className="text-xs h-9 border-brand-300 text-brand-700 hover:bg-brand-50 font-semibold"
                            >
                                <Filter size={13} className="mr-1.5 text-brand-600" />
                                Filtrer
                            </Button>

                            {hasActiveAdjustmentFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetAdjustmentFilters}
                                    className="text-xs text-gray-500 hover:text-gray-900 h-9"
                                >
                                    <RotateCcw size={13} className="mr-1" />
                                    Réinitialiser
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tableau des ajustements */}
                    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-3.5">Date</th>
                                        <th className="px-6 py-3.5">Produit</th>
                                        <th className="px-6 py-3.5">Motif</th>
                                        <th className="px-6 py-3.5">Quantité</th>
                                        <th className="px-6 py-3.5">Avant → Après</th>
                                        <th className="px-6 py-3.5">Effectué par</th>
                                        <th className="px-6 py-3.5">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {filteredAdjustments.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <SlidersHorizontal size={36} className="mx-auto text-gray-300 mb-2" />
                                                <p className="font-semibold text-gray-800 text-sm">
                                                    Aucun ajustement trouvé
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Les corrections manuelles ou d'inventaire apparaîtront ici.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdjustments.map((adj) => {
                                            const qty = parseFloat(adj.quantity) || 0;
                                            const { reasonLabel, cleanNotes } = parseAdjustmentNote(adj.notes);
                                            return (
                                                <tr key={adj.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                                                        {new Date(adj.created_at).toLocaleString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                                        {adj.product_name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full border border-purple-200 inline-block">
                                                            {reasonLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold">
                                                        <span className={qty > 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {qty > 0 ? '+' : ''}
                                                            {Number(adj.quantity)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                                        {Number(adj.stock_before)} →{' '}
                                                        <span className="font-semibold text-gray-800">
                                                            {Number(adj.stock_after)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-700 text-xs font-medium">
                                                        <div className="flex items-center gap-1.5">
                                                            <User size={13} className="text-gray-400" />
                                                            <span>
                                                                {adj.first_name || ''} {adj.last_name || ''}
                                                            </span>
                                                        </div>
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
                            <div className="flex items-center justify-between px-6 py-3.5 border-t bg-gray-50/80">
                                <div className="text-xs font-semibold text-gray-500">
                                    Page {pagination.page} sur {pagination.pages} ({pagination.total} ajustements au total)
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page <= 1}
                                        onClick={() => setAdjustmentPage(pagination.page - 1)}
                                        className="text-xs h-8 font-medium"
                                    >
                                        Précédent
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page >= pagination.pages}
                                        onClick={() => setAdjustmentPage(pagination.page + 1)}
                                        className="text-xs h-8 font-medium"
                                    >
                                        Suivant
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* MODALS : TRANSFERT, AJUSTEMENT & ANNULATION                   */}
            {/* ═════════════════════════════════════════════════════════════ */}
            <TransferModal
                isOpen={transferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                stock={selectedProduct}
                warehouseId={id}
                onSuccess={() => {
                    fetchWarehouseStocks(id);
                    fetchWarehouseMovements(id);
                }}
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