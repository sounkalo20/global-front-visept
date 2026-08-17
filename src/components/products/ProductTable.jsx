'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Package, MoreHorizontal, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import HasPermission from '@/components/auth/HasPermission';
import StockManager from './StockManager';
import ProductDetailModal from './ProductDetailModal';
import useCompanyStore from '@/store/companyStore';
import useWarehouseStore from '@/store/warehouseStore';
import { useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const getStockStatus = (product) => {
    if (!product.manage_stock) return { label: 'N/A', color: 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400' };
    const stock = parseFloat(product.current_stock) || 0;
    const threshold = parseFloat(product.low_stock_threshold) || 0;
    if (stock <= 0) return { label: 'Rupture', color: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400' };
    if (stock <= threshold) return { label: 'Faible', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' };
    return { label: 'OK', color: 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400' };
};

export default function ProductTable({
    products,
    onEdit,
    onDelete,
    onReactivate,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    isAllPageSelected,
    isSomePageSelected,
    isSelected,
}) {
    const [stockModalProduct, setStockModalProduct] = useState(null);
    const [detailModalProduct, setDetailModalProduct] = useState(null);
    const { activeCompany } = useCompanyStore();
    const { warehouses, fetchWarehouses } = useWarehouseStore();

    useEffect(() => {
        if (activeCompany) {
            fetchWarehouses(activeCompany.id);
        }
    }, [activeCompany, fetchWarehouses]);

    const getWarehouseStock = (product, warehouseId) => {
        if (!product.warehouse_stocks) return 0;
        const stockEntry = product.warehouse_stocks.find(ws => ws.warehouse_id === warehouseId);
        return stockEntry ? Number(stockEntry.quantity) : 0;
    };

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block rounded-2xl border border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-[#374151] bg-gray-50/80 dark:bg-[#1F2937]/80 text-xs font-semibold text-gray-500 dark:text-[#D1D5DB] uppercase tracking-wider">
                            {onToggleSelect && (
                                <th className="px-4 py-3 text-center w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllPageSelected || false}
                                        ref={(input) => {
                                            if (input) input.indeterminate = isSomePageSelected || false;
                                        }}
                                        onChange={onToggleSelectAll}
                                        aria-label="Sélectionner tous les produits de la page"
                                        className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                    />
                                </th>
                            )}
                            <th className="px-4 py-3 text-left">Produit</th>
                            <th className="px-4 py-3 text-left">Catégorie</th>
                            <th className="px-4 py-3 text-right">Prix détail</th>
                            <th className="px-4 py-3 text-right">Prix gros</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-center">Statut</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#374151]/60">
                        {products.map((product, index) => {
                            const stockStatus = getStockStatus(product);
                            const selected = isSelected?.(product.id) || false;
                            return (
                                <motion.tr
                                    key={product.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className={cn(
                                        "transition-colors",
                                        selected
                                            ? "bg-brand-50/70 dark:bg-brand-950/40"
                                            : "hover:bg-gray-50/80 dark:hover:bg-[#1F2937]/40"
                                    )}
                                >
                                    {onToggleSelect && (
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => onToggleSelect(product.id)}
                                                aria-label={`Sélectionner ${product.name}`}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer"
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-brand-100 dark:bg-brand-950/60 flex items-center justify-center">
                                                    <Package size={18} className="text-brand-600 dark:text-brand-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className={cn("font-semibold text-sm", product.is_active === 0 ? "text-gray-400 dark:text-slate-600 line-through" : "text-gray-900 dark:text-[#F9FAFB]")}>
                                                    {product.name}
                                                </p>
                                                {product.sku && <p className="text-xs text-gray-400 dark:text-[#9CA3AF]">SKU: {product.sku}</p>}
                                                {product.is_active === 0 && (
                                                    <span className="inline-block mt-1 text-[10px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900">
                                                        Désactivé
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600 dark:text-slate-400">{product.category_name || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-slate-100">
                                        {!product.is_available && parseFloat(product.retail_price) === 0 ? (
                                            <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">Prix à définir</span>
                                        ) : (
                                            `${parseFloat(product.retail_price).toLocaleString()} FCFA`
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-slate-400">
                                        {product.wholesale_price > 0 ? `${parseFloat(product.wholesale_price).toLocaleString()} FCFA` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="font-semibold text-gray-900 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs inline-flex items-center gap-1 border border-gray-200/60 dark:border-slate-700">
                                                <span>boutique:</span>
                                                <span>{Number(product.current_stock)}</span>
                                                <span className="text-[10px] text-gray-500 dark:text-slate-400">{product.unit_symbol || 'pcs'}</span>
                                            </div>
                                            {product.manage_stock === 1 && warehouses.length > 0 && (
                                                <div className="flex flex-col gap-1 mt-1 border-t border-dashed border-gray-200 dark:border-slate-800 pt-1 min-w-[140px] w-full">
                                                    {warehouses.map(w => (
                                                        <div key={w.id} className="text-[10px] text-gray-500 dark:text-slate-400 flex items-start justify-between w-full gap-2">
                                                            <span className="text-left leading-tight">{w.name} :</span>
                                                            <span className={cn("font-medium shrink-0", getWarehouseStock(product, w.id) > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-slate-600")}>
                                                                {getWarehouseStock(product, w.id)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', stockStatus.color)}>
                                            {stockStatus.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300">
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-xl">
                                                <DropdownMenuItem onClick={() => setDetailModalProduct(product)} className="cursor-pointer text-xs dark:hover:bg-slate-800">
                                                    <Eye size={14} className="mr-2 text-gray-500 dark:text-slate-400" /> Voir détails
                                                </DropdownMenuItem>
                                                {product.is_active !== 0 ? (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer text-xs dark:hover:bg-slate-800">
                                                            <Edit size={14} className="mr-2 text-gray-500 dark:text-slate-400" /> Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setStockModalProduct(product)} className="cursor-pointer text-xs dark:hover:bg-slate-800">
                                                            <TrendingUp size={14} className="mr-2 text-gray-500 dark:text-slate-400" /> Gérer le stock
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onDelete(product)} className="cursor-pointer text-xs text-red-600 dark:text-red-400 dark:hover:bg-red-950/30">
                                                            <Trash2 size={14} className="mr-2" /> Supprimer
                                                        </DropdownMenuItem>
                                                    </>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => onReactivate?.(product)} className="cursor-pointer text-xs text-green-600 dark:text-green-400 dark:hover:bg-green-950/30">
                                                        <TrendingUp size={14} className="mr-2" /> Réactiver
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
                {products.map((product, index) => {
                    const stockStatus = getStockStatus(product);
                    const selected = isSelected?.(product.id) || false;
                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className={cn(
                                "rounded-2xl border bg-white dark:bg-[#111827] p-4 shadow-xs transition-colors",
                                selected
                                    ? "border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 dark:border-brand-500"
                                    : "border-gray-200 dark:border-[#374151]"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {onToggleSelect && (
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            onChange={() => onToggleSelect(product.id)}
                                            aria-label={`Sélectionner ${product.name}`}
                                            className="w-4 h-4 rounded border-gray-300 dark:border-[#374151] accent-brand-600 cursor-pointer shrink-0"
                                        />
                                    )}
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-lg bg-brand-100 dark:bg-brand-950/60 flex items-center justify-center shrink-0">
                                            <Package size={20} className="text-brand-600 dark:text-brand-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-slate-100">{product.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">{product.category_name || 'Sans catégorie'}</p>
                                        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold mt-1', stockStatus.color)}>
                                            {stockStatus.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    {!product.is_available && parseFloat(product.retail_price) === 0 ? (
                                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full mb-1 inline-block">Prix à définir</span>
                                    ) : (
                                        <p className="font-bold text-gray-900 dark:text-slate-100">{parseFloat(product.retail_price).toLocaleString()} F</p>
                                    )}
                                    <div className="mt-1 font-semibold text-gray-900 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs inline-flex items-center gap-1 border border-gray-200/60 dark:border-slate-700">
                                        <span>Total:</span>
                                        <span>{Number(product.current_stock)}</span>
                                        <span className="text-[10px] text-gray-500 dark:text-slate-400">{product.unit_symbol || 'pcs'}</span>
                                    </div>
                                    {product.manage_stock === 1 && warehouses.length > 0 && (
                                        <div className="flex flex-col gap-1 mt-2 border-t border-dashed border-gray-200 dark:border-slate-800 pt-1 w-full min-w-[140px]">
                                            {warehouses.map(w => (
                                                <div key={w.id} className="text-[10px] text-gray-500 dark:text-slate-400 flex items-start justify-between w-full gap-2">
                                                    <span className="text-left leading-tight">{w.name} :</span>
                                                    <span className={cn("font-medium shrink-0 ml-2", getWarehouseStock(product, w.id) > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-slate-600")}>
                                                        {getWarehouseStock(product, w.id)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                                <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setDetailModalProduct(product)}>
                                    <Eye size={14} className="mr-1" /> Détails
                                </Button>
                                {product.is_active !== 0 ? (
                                    <>
                                        <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => onEdit(product)}>
                                            <Edit size={14} className="mr-1" /> Modifier
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 text-xs border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setStockModalProduct(product)}>
                                            <TrendingUp size={14} className="mr-1" /> Stock
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => onDelete(product)} className="border-gray-200 dark:border-slate-700 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                                            <Trash2 size={14} />
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" size="sm" className="flex-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={() => onReactivate?.(product)}>
                                        <TrendingUp size={14} className="mr-1" /> Réactiver
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Modal de gestion de stock */}
            <Dialog open={!!stockModalProduct} onOpenChange={(open) => { if (!open) setStockModalProduct(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Gérer le stock - {stockModalProduct?.name}</DialogTitle>
                    </DialogHeader>
                    {stockModalProduct && (
                        <StockManager 
                            product={stockModalProduct} 
                            onClose={() => setStockModalProduct(null)} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal détails produit */}
            {activeCompany && (
                <ProductDetailModal
                    open={!!detailModalProduct}
                    onOpenChange={(open) => { if (!open) setDetailModalProduct(null); }}
                    product={detailModalProduct}
                    companyId={activeCompany.id}
                />
            )}
        </>
    );
}