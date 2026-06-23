// components/restaurant/DishFormModal.jsx
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useCompanyStore from '@/store/companyStore';
import useRestaurantDishStore from '@/store/restaurantDishStore';
import { categoriesApi } from '@/lib/api/categories';

export default function DishFormModal({ isOpen, onClose, dish }) {
    const isEditing = !!dish;
    const { createDish, updateDish } = useRestaurantDishStore();
    const activeCompany = useCompanyStore((s) => s.activeCompany);
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '', category_id: '', description: '', ingredients_text: '',
            retail_price: '0', cost_price: '0', unit_id: '7', is_available: true,
        },
    });

    useEffect(() => {
        if (isOpen && activeCompany?.id) {
            categoriesApi.getAll(activeCompany.id).then(r => setCategories(r.data.data.categories || [])).catch(() => { });
            if (dish) {
                reset({
                    name: dish.name || '', category_id: dish.category_id ? String(dish.category_id) : '',
                    description: dish.description || '', ingredients_text: dish.ingredients_text || '',
                    retail_price: dish.retail_price || '0', cost_price: dish.cost_price || '0',
                    unit_id: dish.unit_id ? String(dish.unit_id) : '7', is_available: dish.is_available ?? true,
                });
                setImagePreview(dish.image_url || null);
            } else {
                reset({ name: '', category_id: '', description: '', ingredients_text: '', retail_price: '0', cost_price: '0', unit_id: '7', is_available: true });
                setImagePreview(null);
            }
            setImage(null);
        }
    }, [isOpen, dish, reset, activeCompany]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('ingredients_text', data.ingredients_text || '');
        formData.append('retail_price', data.retail_price);
        formData.append('cost_price', data.cost_price || '0');
        formData.append('unit_id', data.unit_id);
        formData.append('is_available', data.is_available);
        if (data.category_id) formData.append('category_id', data.category_id);
        if (image) formData.append('image', image);

        const result = isEditing ? await updateDish(dish.id, formData) : await createDish(formData);
        setIsSubmitting(false);
        if (result.success) { toast.success(isEditing ? 'Plat mis à jour.' : 'Plat créé.'); onClose(); }
        else toast.error(result.message);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Modifier le plat' : 'Nouveau plat'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Photo du plat</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload size={24} className="text-gray-400" />
                                )}
                            </div>
                            <label className="cursor-pointer text-sm text-brand-600 hover:text-brand-700">
                                {imagePreview ? 'Changer' : 'Ajouter une photo'}
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nom du plat *</label>
                        <Input placeholder="Ex: Riz gras" {...register('name', { required: 'Nom requis' })} error={errors.name?.message} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Catégorie</label>
                            <Select value={watch('category_id')} onValueChange={(v) => setValue('category_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Aucune</SelectItem>
                                    {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Unité</label>
                            <Select value={watch('unit_id')} onValueChange={(v) => setValue('unit_id', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Pièce</SelectItem>
                                    <SelectItem value="7">Service</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Prix de vente *</label>
                            <Input type="number" step="0.01" min="0" {...register('retail_price', { required: 'Prix requis' })} error={errors.retail_price?.message} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Coût de revient</label>
                            <Input type="number" step="0.01" min="0" {...register('cost_price')} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea rows={2} placeholder="Description du plat..." {...register('description')} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Ingrédients <span className="text-gray-400 font-normal">(texte libre)</span>
                        </label>
                        <Textarea
                            rows={3}
                            placeholder="Riz, viande, légumes, épices..."
                            {...register('ingredients_text')}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Liste des ingrédients affichée sur le menu. Max 2000 caractères.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={watch('is_available')}
                            onChange={(e) => setValue('is_available', e.target.checked)}
                            className="rounded"
                        />
                        <label className="text-sm">Plat disponible à la vente</label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                            {isEditing ? 'Mettre à jour' : 'Créer le plat'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}