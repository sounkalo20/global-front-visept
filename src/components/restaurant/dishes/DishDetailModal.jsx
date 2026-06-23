// components/restaurant/DishDetailModal.jsx
'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { restaurantApi } from '@/lib/api/restaurant';
import useCompanyStore from '@/store/companyStore';
import { Utensils, Package, DollarSign, FileText, Pencil } from 'lucide-react';

export default function DishDetailModal({ isOpen, onClose, dishId, onEdit }) {
    const [dish, setDish] = useState(null);
    const [loading, setLoading] = useState(false);
    const activeCompany = useCompanyStore((s) => s.activeCompany);

    useEffect(() => {
        if (isOpen && dishId && activeCompany?.id) {
            setLoading(true);
            restaurantApi.getDishById(dishId, activeCompany.id)
                .then(r => setDish(r.data.data.product))
                .finally(() => setLoading(false));
        }
    }, [isOpen, dishId, activeCompany]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{loading ? 'Chargement...' : dish?.name}</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                    </div>
                ) : dish ? (
                    <div className="space-y-4">
                        {dish.image_url && (
                            <img src={dish.image_url} alt={dish.name} className="w-full h-48 object-cover rounded-xl" />
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Prix de vente</p>
                                <p className="text-lg font-bold text-brand-700">{Number(dish.retail_price).toLocaleString()} FCFA</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Coût de revient</p>
                                <p className="text-lg font-bold">{Number(dish.cost_price).toLocaleString()} FCFA</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Catégorie</p>
                                <p className="font-medium text-sm">{dish.category_name || '-'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">Statut</p>
                                {dish.is_available ? (
                                    <Badge className="bg-green-100 text-green-700">Disponible</Badge>
                                ) : (
                                    <Badge className="bg-red-100 text-red-700">Indisponible</Badge>
                                )}
                            </div>
                        </div>

                        {dish.description && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                    <FileText size={12} /> Description
                                </p>
                                <p className="text-sm">{dish.description}</p>
                            </div>
                        )}

                        {dish.ingredients_text && (
                            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                <p className="text-xs text-orange-600 mb-1 flex items-center gap-1 font-medium">
                                    <Utensils size={12} /> Ingrédients
                                </p>
                                <p className="text-sm text-gray-700">{dish.ingredients_text}</p>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => onEdit(dish)}>
                                <Pencil size={16} className="mr-2" />Modifier
                            </Button>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}