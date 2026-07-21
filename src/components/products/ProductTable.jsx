'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Package, MoreHorizontal, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import StockManager from './StockManager';
import ProductDetailModal from './ProductDetailModal';
import useCompanyStore from '@/store/companyStore';
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
    if (!product.manage_stock) return { label: 'N/A', color: 'bg-gray-100 text-gray-500' };
    const stock = parseFloat(product.current_stock) || 0;
    const threshold = parseFloat(product.low_stock_threshold) || 0;
    if (stock <= 0) return { label: 'Rupture', color: 'bg-red-100 text-red-700' };
    if (stock <= threshold) return { label: 'Faible', color: 'bg-amber-100 text-amber-700' };
    return { label: 'OK', color: 'bg-green-100 text-green-700' };
};

export default function ProductTable({ products, onEdit, onDelete }) {
    const [stockModalProduct, setStockModalProduct] = useState(null);
    const [detailModalProduct, setDetailModalProduct] = useState(null);
    const { activeCompany } = useCompanyStore();

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block rounded-xl border bg-white overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                            <th className="px-4 py-3 text-left">Produit</th>
                            <th className="px-4 py-3 text-left">Catégorie</th>
                            <th className="px-4 py-3 text-right">Prix détail</th>
                            <th className="px-4 py-3 text-right">Prix gros</th>
                            <th className="px-4 py-3 text-right">Stock</th>
                            <th className="px-4 py-3 text-center">Statut</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product, index) => {
                            const stockStatus = getStockStatus(product);
                            return (
                                <motion.tr
                                    key={product.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                                                    <Package size={18} className="text-brand-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600">{product.category_name || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {!product.is_available && parseFloat(product.retail_price) === 0 ? (
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Prix à définir</span>
                                        ) : (
                                            `${parseFloat(product.retail_price).toLocaleString()} FCFA`
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                                        {product.wholesale_price > 0 ? `${parseFloat(product.wholesale_price).toLocaleString()} FCFA` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="font-medium">{product.current_stock}</span>
                                        <span className="text-xs text-gray-400 ml-1">{product.unit_symbol || 'pcs'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', stockStatus.color)}>
                                            {stockStatus.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setDetailModalProduct(product)}>
                                                    <Eye size={14} className="mr-2" /> Voir détails
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(product)}>
                                                    <Edit size={14} className="mr-2" /> Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setStockModalProduct(product)}>
                                                    <TrendingUp size={14} className="mr-2" /> Gérer le stock
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-600">
                                                    <Trash2 size={14} className="mr-2" /> Supprimer
                                                </DropdownMenuItem>
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
                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="rounded-xl border bg-white p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                                    ) : (
                                        <div className="h-12 w-12 rounded-lg bg-brand-100 flex items-center justify-center">
                                            <Package size={20} className="text-brand-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.category_name || 'Sans catégorie'}</p>
                                        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium mt-1', stockStatus.color)}>
                                            {stockStatus.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {!product.is_available && parseFloat(product.retail_price) === 0 ? (
                                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mb-1 inline-block">Prix à définir</span>
                                    ) : (
                                        <p className="font-semibold">{parseFloat(product.retail_price).toLocaleString()} F</p>
                                    )}
                                    <p className="text-sm text-gray-500">{product.current_stock} {product.unit_symbol || 'pcs'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t">
                                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setDetailModalProduct(product)}>
                                    <Eye size={14} className="mr-1" /> Détails
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onEdit(product)}>
                                    <Edit size={14} className="mr-1" /> Modifier
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setStockModalProduct(product)}>
                                    <TrendingUp size={14} className="mr-1" /> Stock
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => onDelete(product)} className="text-red-500">
                                    <Trash2 size={14} />
                                </Button>
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