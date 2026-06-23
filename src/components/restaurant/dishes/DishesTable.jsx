// components/restaurant/DishesTable.jsx
'use client';
import { useState } from 'react';
import { Eye, Pencil, Trash2, Power, PowerOff, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import DishDetailModal from './DishDetailModal';
import DishFormModal from './DishFormModal';
import ConfirmModal from '@/components/super-admin/ConfirmModal';
import useRestaurantDishStore from '@/store/restaurantDishStore';
import { toast } from 'sonner';

export default function DishesTable() {
    const { dishes, pagination, isLoading, setPage, deleteDish, toggleAvailability } = useRestaurantDishStore();

    const [selectedId, setSelectedId] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingDish, setEditingDish] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const openDetail = (id) => { setSelectedId(id); setDetailOpen(true); };
    const openEdit = (dish) => { setEditingDish(dish); setFormOpen(true); };
    const openDelete = (dish) => { setConfirmAction('delete'); setConfirmTarget(dish); setConfirmOpen(true); };
    const openToggle = (dish) => { setConfirmAction(dish.is_available ? 'disable' : 'enable'); setConfirmTarget(dish); setConfirmOpen(true); };

    const handleConfirm = async () => {
        setConfirmLoading(true);
        let result;
        if (confirmAction === 'delete') result = await deleteDish(confirmTarget.id);
        else result = await toggleAvailability(confirmTarget.id);
        setConfirmLoading(false);
        if (result.success) toast.success(result.message || 'Opération réussie.');
        else toast.error(result.message);
        setConfirmOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            </div>
        );
    }

    if (dishes.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                <Utensils size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-400">Aucun plat trouvé</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Plat</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead className="text-right">Prix</TableHead>
                            <TableHead className="text-right">Coût</TableHead>
                            <TableHead className="text-center">Disponible</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dishes.map((dish) => (
                            <TableRow key={dish.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {dish.image_url ? (
                                            <img src={dish.image_url} alt={dish.name} className="w-10 h-10 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                                <Utensils size={18} className="text-orange-500" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{dish.name}</p>
                                            {dish.ingredients_text && (
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{dish.ingredients_text}</p>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm">{dish.category_name || '-'}</span>
                                </TableCell>
                                <TableCell className="text-right font-medium text-sm">
                                    {Number(dish.retail_price).toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="text-right text-sm text-gray-500">
                                    {Number(dish.cost_price).toLocaleString()} FCFA
                                </TableCell>
                                <TableCell className="text-center">
                                    {dish.is_available ? (
                                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Oui</span>
                                    ) : (
                                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Non</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openDetail(dish.id)}><Eye size={16} /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(dish)}><Pencil size={16} /></Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openToggle(dish)}
                                            className={dish.is_available ? 'text-amber-600' : 'text-green-600'}
                                        >
                                            {dish.is_available ? <PowerOff size={16} /> : <Power size={16} />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openDelete(dish)} className="text-red-600">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {pagination && pagination.total_pages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem><PaginationPrevious onClick={() => setPage(Math.max(1, pagination.page - 1))} disabled={pagination.page === 1} /></PaginationItem>
                            <PaginationItem><span className="text-sm text-gray-500 px-4">Page {pagination.page} sur {pagination.total_pages}</span></PaginationItem>
                            <PaginationItem><PaginationNext onClick={() => setPage(Math.min(pagination.total_pages, pagination.page + 1))} disabled={pagination.page === pagination.total_pages} /></PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <DishDetailModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} dishId={selectedId} onEdit={openEdit} />
            <DishFormModal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditingDish(null); }} dish={editingDish} />

            <ConfirmModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
                title={confirmAction === 'delete' ? 'Supprimer ce plat' : confirmAction === 'disable' ? 'Rendre indisponible' : 'Rendre disponible'}
                description={confirmAction === 'delete' ? `Supprimer "${confirmTarget?.name}" ?` : `Changer la disponibilité de "${confirmTarget?.name}" ?`}
                confirmLabel={confirmAction === 'delete' ? 'Supprimer' : 'Confirmer'}
                confirmVariant={confirmAction === 'delete' ? 'destructive' : 'default'}
                isLoading={confirmLoading}
            />
        </>
    );
}