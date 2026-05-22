'use client';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react';
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

export default function ProductModal({ open, onOpenChange, product, onSuccess }) {
    const [step, setStep] = useState(1);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const { addProduct, updateProduct } = useProductStore();
    const { activeCompany } = useCompanyStore();
    const { categories, addCategory } = useCategoryStore();

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
            setStep(1);
        } else if (!product && open) {
            reset();
            setImageFile(null);
            setStep(1);
        }
    }, [product, open, reset]);

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

        let result;
        if (isEditing) {
            result = await updateProduct(product.id, formData);
        } else {
            result = await addProduct(formData);
        }
        setIsSubmitting(false);

        if (result.success) {
            toast.success(isEditing ? 'Produit modifié.' : 'Produit créé.');
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

    const totalSteps = 3;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modifiez les informations du produit.' : 'Ajoutez un nouveau produit à votre inventaire.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Étapes */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                                    step > s ? 'bg-brand-600 text-white' :
                                        step === s ? 'bg-brand-100 text-brand-700 border-2 border-brand-500' :
                                            'bg-gray-100 text-gray-400'
                                )}
                            >
                                {step > s ? <Check size={14} /> : s}
                            </div>
                            {s < totalSteps && <div className={cn('h-0.5 w-6', step > s ? 'bg-brand-600' : 'bg-gray-200')} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(onSubmit)(e);
                }}>
                    <AnimatePresence mode="wait">
                        {/* STEP 1 */}
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h3 className="font-medium">Informations produit</h3>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nom *</label>
                                    <Input placeholder="Nom du produit" error={errors.name?.message} {...register('name')} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <Input placeholder="Description courte" error={errors.description?.message} {...register('description')} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">SKU</label>
                                        <Input placeholder="Réf. interne" error={errors.sku?.message} {...register('sku')} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Code-barres</label>
                                        <Input placeholder="Scanner ou saisir" error={errors.barcode?.message} {...register('barcode')} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h3 className="font-medium">Prix & Stock</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Prix de revient</label>
                                        <Input type="number" step="0.01" {...register('cost_price')} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Prix vente détail *</label>
                                        <Input type="number" step="0.01" error={errors.retail_price?.message} {...register('retail_price')} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Prix de gros</label>
                                        <Input type="number" step="0.01" {...register('wholesale_price')} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Qté min. gros</label>
                                        <Input type="number" {...register('wholesale_min_qty')} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Stock initial</label>
                                        <Input type="number" {...register('current_stock')} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Seuil alerte</label>
                                        <Input type="number" {...register('low_stock_threshold')} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <h3 className="font-medium">Catégorie & Image</h3>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Catégorie</label>
                                    {!showNewCategory ? (
                                        <div className="flex gap-2">
                                            <select
                                                {...register('category_id')}
                                                className="flex-1 h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm"
                                            >
                                                <option value="">Aucune catégorie</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <Button type="button" variant="outline" size="icon" onClick={() => setShowNewCategory(true)}>
                                                <Plus size={16} />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Nouvelle catégorie"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                            />
                                            <Button type="button" size="sm" onClick={handleAddCategory}>Ajouter</Button>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCategory(false)}>Annuler</Button>
                                        </div>
                                    )}
                                </div>
                                <ImageUpload currentImage={product?.image_url} onFileChange={setImageFile} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6 pt-4 border-t">
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                                <ArrowLeft size={16} className="mr-1" /> Retour
                            </Button>
                        ) : <div />}
                        {step < totalSteps ? (
                            <Button type="button" onClick={() => setStep(step + 1)}>
                                Suivant <ArrowRight size={16} className="ml-1" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <><Loader2 size={16} className="animate-spin mr-2" /> Enregistrement...</>
                                ) : isEditing ? 'Enregistrer' : 'Créer le produit'}
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}