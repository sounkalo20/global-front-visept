// components/products/CompositionsSection.jsx (NOUVEAU)
'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useProductStore from '@/store/productStore';
import useCompanyStore from '@/store/companyStore';
import { toast } from 'sonner';

export default function CompositionsSection({ productId, isEditing }) {
    const { fetchCompositions, updateCompositions, products, fetchProducts } = useProductStore();
    const activeCompany = useCompanyStore((s) => s.activeCompany);
    const [compositions, setCompositions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [ingredients, setIngredients] = useState([]);

    useEffect(() => {
        if (activeCompany && productId && isEditing) {
            loadCompositions();
            // Charger les ingrédients disponibles
            fetchProducts(activeCompany.id).then(() => {
                // Filtrer pour n'avoir que les ingrédients
                const storeProducts = useProductStore.getState().products;
                setIngredients(storeProducts.filter(p => p.product_type === 'ingredient'));
            });
        }
    }, [productId, activeCompany, isEditing]);

    const loadCompositions = async () => {
        setIsLoading(true);
        const result = await fetchCompositions(productId);
        if (result && result.length > 0) {
            setCompositions(result.map(c => ({
                ...c,
                ingredient_id: c.ingredient_id,
                quantity_used: c.quantity_used,
                unit_id: c.unit_id,
                is_optional: c.is_optional,
            })));
        }
        setIsLoading(false);
    };

    const addRow = () => {
        setCompositions([...compositions, {
            ingredient_id: '',
            quantity_used: '1',
            unit_id: 1,
            is_optional: false,
        }]);
    };

    const removeRow = (index) => {
        setCompositions(compositions.filter((_, i) => i !== index));
    };

    const updateRow = (index, field, value) => {
        const updated = [...compositions];
        updated[index] = { ...updated[index], [field]: value };
        setCompositions(updated);
    };

    const handleSave = async () => {
        // Valider
        for (const comp of compositions) {
            if (!comp.ingredient_id) {
                toast.error('Veuillez sélectionner un ingrédient pour chaque ligne.');
                return;
            }
        }

        setIsSaving(true);
        const result = await updateCompositions(productId, compositions);
        setIsSaving(false);

        if (result.success) {
            toast.success('Compositions enregistrées.');
        } else {
            toast.error(result.message);
        }
    };

    if (!isEditing) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                Enregistrez le plat avant de pouvoir gérer sa composition.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">
                    🍳 Composition du plat
                </h4>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <Plus size={14} className="mr-1" /> Ajouter un ingrédient
                </Button>
            </div>

            <p className="text-xs text-gray-400">
                Définissez les ingrédients nécessaires pour une portion de ce plat.
            </p>

            {compositions.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-400 border border-dashed rounded-lg">
                    Aucun ingrédient ajouté. Cliquez sur "Ajouter un ingrédient".
                </div>
            ) : (
                <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                        <div className="col-span-5">Ingrédient</div>
                        <div className="col-span-3">Quantité / portion</div>
                        <div className="col-span-2">Unité</div>
                        <div className="col-span-1 text-center">Opt.</div>
                        <div className="col-span-1"></div>
                    </div>

                    {compositions.map((comp, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-2">
                            {/* Ingrédient */}
                            <div className="col-span-5">
                                <Select
                                    value={String(comp.ingredient_id)}
                                    onValueChange={(v) => updateRow(index, 'ingredient_id', parseInt(v))}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Choisir..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ingredients.map((ing) => (
                                            <SelectItem key={ing.id} value={String(ing.id)}>
                                                {ing.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Quantité */}
                            <div className="col-span-3">
                                <Input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={comp.quantity_used}
                                    onChange={(e) => updateRow(index, 'quantity_used', parseFloat(e.target.value) || 0)}
                                    className="h-8 text-xs"
                                />
                            </div>

                            {/* Unité */}
                            <div className="col-span-2">
                                <Select
                                    value={String(comp.unit_id || 1)}
                                    onValueChange={(v) => updateRow(index, 'unit_id', parseInt(v))}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">pcs</SelectItem>
                                        <SelectItem value="2">kg</SelectItem>
                                        <SelectItem value="3">g</SelectItem>
                                        <SelectItem value="4">L</SelectItem>
                                        <SelectItem value="5">ml</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Optionnel */}
                            <div className="col-span-1 text-center">
                                <input
                                    type="checkbox"
                                    checked={comp.is_optional}
                                    onChange={(e) => updateRow(index, 'is_optional', e.target.checked)}
                                    className="rounded"
                                />
                            </div>

                            {/* Supprimer */}
                            <div className="col-span-1 text-center">
                                <button
                                    type="button"
                                    onClick={() => removeRow(index)}
                                    className="text-red-400 hover:text-red-600"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {compositions.length > 0 && (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                        Enregistrer les compositions
                    </Button>
                </div>
            )}
        </div>
    );
}