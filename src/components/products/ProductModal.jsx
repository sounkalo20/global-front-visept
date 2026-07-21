'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Check, Plus, HelpCircle, Package, Tags, Coins, Box, ImageIcon, Info } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from './ImageUpload';
import useProductStore from '@/store/productStore';
import useCompanyStore from '@/store/companyStore';
import useCategoryStore from '@/store/categoryStore';
import useWarehouseStore from '@/store/warehouseStore';
import { cn } from '@/lib/utils';

const productSchema = z.object({
    name: z.string().min(2, 'Minimum 2 caractères.').max(200),
    description: z.string().max(2000).optional().or(z.literal('')),
    barcode: z.string().max(100).optional().or(z.literal('')),
    sku: z.string().max(100).optional().or(z.literal('')),
    cost_price: z.coerce.number().min(0, 'Minimum 0'),
    retail_price: z.coerce.number().min(0, 'Minimum 0'),
    wholesale_price: z.coerce.number().min(0).optional(),
    wholesale_min_qty: z.coerce.number().min(1).optional(),
    current_stock: z.coerce.number().min(0).optional(),
    low_stock_threshold: z.coerce.number().min(0).optional(),
    category_id: z.string().optional(),
    unit_id: z.string().optional(),
});

// --- Tooltip component maison ---
const Tooltip = ({ content, children }) => (
    <span className="group relative ml-1.5 inline-flex cursor-help">
        <HelpCircle size={14} className="text-slate-400 hover:text-slate-600 transition-colors" />
        <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full w-48 rounded-lg bg-slate-800 px-3 py-2 text-[11px] leading-relaxed text-slate-100 opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 z-50 text-center">
            {content}
            <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 h-2 w-2 rotate-45 bg-slate-800" />
        </span>
    </span>
);

// --- Section Header ---
const SectionHeader = ({ icon: Icon, title, subtitle, color }) => (
    <div className="flex items-start gap-3 pb-3 mb-1">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
    </div>
);

export default function ProductModal({ open, onOpenChange, product, onSuccess }) {
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const { addProduct, updateProduct } = useProductStore();
    const { activeCompany } = useCompanyStore();
    const { categories, addCategory } = useCategoryStore();
    const { warehouses, fetchWarehouses } = useWarehouseStore();

    const [warehouseStocks, setWarehouseStocks] = useState({});

    const isEditing = !!product;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            barcode: '',
            sku: '',
            cost_price: 0,
            retail_price: 0,
            wholesale_price: 0,
            wholesale_min_qty: 1,
            current_stock: 0,
            low_stock_threshold: 10,
            category_id: '',
            unit_id: '1',
        },
    });

    useEffect(() => {
        if (product && open) {
            reset({
                name: product.name || '',
                description: product.description || '',
                barcode: product.barcode || '',
                sku: product.sku || '',
                cost_price: product.cost_price || 0,
                retail_price: product.retail_price || 0,
                wholesale_price: product.wholesale_price || 0,
                wholesale_min_qty: product.wholesale_min_qty || 1,
                current_stock: product.current_stock || 0,
                low_stock_threshold: product.low_stock_threshold || 10,
                category_id: product.category_id?.toString() || '',
                unit_id: product.unit_id?.toString() || '1',
            });
            setImageFile(null);
        } else if (!product && open) {
            reset();
            setImageFile(null);
            setWarehouseStocks({});
            if (activeCompany?.my_role === 'owner') {
                fetchWarehouses();
            }
        }
    }, [product, open, reset, activeCompany]);

    const handleWarehouseStockChange = (warehouseId, qty) => {
        setWarehouseStocks(prev => ({
            ...prev,
            [warehouseId]: qty
        }));
    };

    const onSubmit = async (data) => {
        if (!activeCompany) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('company_id', activeCompany.id);
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('barcode', data.barcode || '');
        formData.append('sku', data.sku || '');
        formData.append('cost_price', data.cost_price);
        formData.append('retail_price', data.retail_price);
        formData.append('wholesale_price', data.wholesale_price || 0);
        formData.append('wholesale_min_qty', data.wholesale_min_qty || 1);
        formData.append('current_stock', data.current_stock || 0);
        formData.append('low_stock_threshold', data.low_stock_threshold || 10);
        formData.append('category_id', data.category_id || '');
        formData.append('unit_id', data.unit_id || '1');
        formData.append('manage_stock', 1);
        formData.append('is_active', 1);
        formData.append('is_available', 1);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (!isEditing && activeCompany?.my_role === 'owner') {
            const stocksArray = Object.entries(warehouseStocks)
                .filter(([_, qty]) => parseFloat(qty) > 0)
                .map(([warehouseId, qty]) => ({
                    warehouse_id: parseInt(warehouseId),
                    quantity: parseFloat(qty)
                }));
            if (stocksArray.length > 0) {
                formData.append('warehouse_stocks', JSON.stringify(stocksArray));
            }
        }

        let result;
        if (isEditing) {
            result = await updateProduct(product.id, formData);
        } else {
            result = await addProduct(formData);
        }
        setIsSubmitting(false);

        if (result.success) {
            toast.success(isEditing ? 'Produit modifié.' : 'Produit créé avec succès !');
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } else {
            toast.error(result.message);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !activeCompany) return;
        const result = await addCategory({
            company_id: activeCompany.id,
            name: newCategoryName.trim(),
        });
        if (result.success) {
            setValue('category_id', result.category.id.toString());
            setNewCategoryName('');
            setShowNewCategory(false);
            toast.success('Catégorie ajoutée.');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto p-0">

                {/* --- Header --- */}
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-8 py-5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-800">
                            {isEditing ? '✏️ Modifier le produit' : '✨ Nouveau produit'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 mt-1">
                            {isEditing
                                ? 'Modifiez les informations du produit existant.'
                                : 'Remplissez le formulaire ci-dessous pour ajouter un produit à votre inventaire.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* --- Formulaire --- */}
                <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">

                    {/* ───────── SECTION 1 : Informations générales ───────── */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                    >
                        <SectionHeader
                            icon={Package}
                            title="Informations générales"
                            subtitle="Identité du produit"
                            color="bg-blue-500"
                        />

                        <div className="space-y-5 mt-4">
                            {/* Nom */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                    Nom du produit <span className="text-red-400 ml-0.5">*</span>
                                    <Tooltip content="Le nom complet du produit tel qu'il apparaîtra dans votre catalogue et sur les tickets de caisse." />
                                </label>
                                <Input
                                    placeholder="Ex: Riz parfumé 25kg"
                                    error={errors.name?.message}
                                    {...register('name')}
                                    className="h-11"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                    Description
                                    <Tooltip content="Une description courte (optionnelle) pour donner plus de détails sur le produit. Visible dans le catalogue." />
                                </label>
                                <Input
                                    placeholder="Description courte du produit..."
                                    error={errors.description?.message}
                                    {...register('description')}
                                    className="h-11"
                                />
                            </div>

                            {/* SKU + Code-barres */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                        SKU (Référence)
                                        <Tooltip content="Code interne unique pour identifier le produit dans votre gestion. Laissez vide pour génération automatique." />
                                    </label>
                                    <Input
                                        placeholder="Ex: RIZ-001"
                                        error={errors.sku?.message}
                                        {...register('sku')}
                                        className="h-11 font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                        Code-barres
                                        <Tooltip content="Code-barres EAN/UPC du produit. Utilisé pour le scan rapide en caisse. Vous pouvez le scanner directement." />
                                    </label>
                                    <Input
                                        placeholder="Ex: 6181100310297"
                                        error={errors.barcode?.message}
                                        {...register('barcode')}
                                        className="h-11 font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* ───────── SECTION 2 : Prix ───────── */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                    >
                        <SectionHeader
                            icon={Coins}
                            title="Tarification"
                            subtitle="Prix de revient et de vente"
                            color="bg-amber-500"
                        />

                        <div className="space-y-5 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Prix de revient */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                        Prix de revient
                                        <Tooltip content="Le prix auquel vous achetez ce produit (coût d'achat). Sert à calculer vos marges." />
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">CFA</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0"
                                            {...register('cost_price')}
                                            className="h-11 pl-12"
                                        />
                                    </div>
                                </div>

                                {/* Prix vente détail */}
                                <div>
                                    <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                        Prix vente détail <span className="text-red-400 ml-0.5">*</span>
                                        <Tooltip content="Le prix auquel vous vendez ce produit à l'unité. C'est le prix affiché en boutique." />
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">CFA</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0"
                                            error={errors.retail_price?.message}
                                            {...register('retail_price')}
                                            className="h-11 pl-12"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Prix de gros */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                        Prix de gros
                                        <Tooltip content="Prix spécial pour les achats en grande quantité. Laissez 0 si vous ne proposez pas de tarif de gros." />
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">CFA</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0"
                                            {...register('wholesale_price')}
                                            className="h-11 pl-12"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                        Qté min. gros
                                        <Tooltip content="Quantité minimum à partir de laquelle le prix de gros s'applique." />
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="1"
                                        {...register('wholesale_min_qty')}
                                        className="h-11"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* ───────── SECTION 3 : Stock ───────── */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                    >
                        <SectionHeader
                            icon={Box}
                            title="Gestion du stock"
                            subtitle="Quantités et alertes"
                            color="bg-emerald-500"
                        />

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                    Stock initial
                                    <Tooltip content="La quantité actuelle en stock. Pour un nouveau produit, indiquez le stock de départ." />
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    {...register('current_stock')}
                                    className="h-11"
                                />
                            </div>
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                    Seuil d'alerte
                                    <Tooltip content="Quantité minimum avant de recevoir une alerte de réapprovisionnement. Par défaut : 10 unités." />
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="10"
                                        {...register('low_stock_threshold')}
                                        className="h-11 pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                        unités
                                    </span>
                                </div>
                            </div>
                            
                            {!isEditing && activeCompany?.my_role === 'owner' && warehouses.length > 0 && (
                                <div className="col-span-2 mt-2 pt-4 border-t border-slate-100">
                                    <label className="flex items-center text-sm font-medium text-slate-700 mb-3">
                                        Stock initial en entrepôt
                                        <Tooltip content="Définissez les quantités initiales de ce produit dans vos entrepôts." />
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {warehouses.map(w => (
                                            <div key={w.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-800 line-clamp-1">{w.name}</p>
                                                </div>
                                                <div className="w-24">
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        min="0"
                                                        value={warehouseStocks[w.id] || ''}
                                                        onChange={(e) => handleWarehouseStockChange(w.id, e.target.value)}
                                                        className="h-9 text-right"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.section>

                    {/* ───────── SECTION 4 : Catégorie & Image ───────── */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                    >
                        <SectionHeader
                            icon={Tags}
                            title="Classification & Image"
                            subtitle="Catégorie et visuel du produit"
                            color="bg-violet-500"
                        />

                        <div className="space-y-5 mt-4">
                            {/* Catégorie */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                    Catégorie
                                    <Tooltip content="Classez votre produit dans une catégorie pour mieux organiser votre inventaire et vos rapports de vente." />
                                </label>
                                {!showNewCategory ? (
                                    <div className="flex gap-2">
                                        <select
                                            {...register('category_id')}
                                            className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all appearance-none"
                                            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2394a3b8%27 stroke-width=%272%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E')", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                                        >
                                            <option value="">Aucune catégorie</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowNewCategory(true)}
                                            className="h-11 w-11 rounded-xl border-dashed border-slate-300 hover:border-violet-400 hover:text-violet-600 transition-all"
                                        >
                                            <Plus size={18} />
                                        </Button>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-2"
                                        >
                                            <Input
                                                placeholder="Nom de la catégorie"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                className="h-11"
                                                autoFocus
                                            />
                                            <Button type="button" size="sm" onClick={handleAddCategory} className="h-11 px-4 bg-violet-500 hover:bg-violet-600">
                                                Ajouter
                                            </Button>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCategory(false)} className="h-11">
                                                Annuler
                                            </Button>
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </div>

                            {/* Image */}
                            <div>
                                <label className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
                                    Image du produit
                                    <Tooltip content="Ajoutez une photo du produit. Format conseillé : carré, minimum 400x400px. Max 2 Mo." />
                                </label>
                                <ImageUpload currentImage={product?.image_url} onFileChange={setImageFile} />
                            </div>
                        </div>
                    </motion.section>

                    {/* ───────── BOUTON SUBMIT ───────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-end gap-3 pt-4 border-t border-slate-100"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-11 px-6 rounded-xl"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 px-8 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-300"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Enregistrement...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Check size={18} />
                                    {isEditing ? 'Enregistrer les modifications' : 'Créer le produit'}
                                </span>
                            )}
                        </Button>
                    </motion.div>

                </form>
            </DialogContent>
        </Dialog>
    );
}