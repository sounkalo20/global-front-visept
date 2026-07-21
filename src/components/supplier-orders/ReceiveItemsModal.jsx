// components/supplier-orders/ReceiveItemsModal.jsx (NOUVEAU)
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useSupplierOrderStore from '@/store/supplierOrderStore';
import useWarehouseStore from '@/store/warehouseStore';
import { useEffect } from 'react';

export default function ReceiveItemsModal({ isOpen, onClose, order, items }) {
    const [quantities, setQuantities] = useState({});
    const [destinationType, setDestinationType] = useState('shop');
    const [warehouseId, setWarehouseId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { receiveItems } = useSupplierOrderStore();
    const { warehouses, fetchWarehouses } = useWarehouseStore();

    useEffect(() => {
        if (isOpen) {
            fetchWarehouses();
        }
    }, [isOpen]);

    const handleQuantityChange = (itemId, value) => {
        setQuantities(prev => ({ ...prev, [itemId]: value }));
    };

    const getRemaining = (item) => {
        return parseFloat(item.quantity_ordered) - parseFloat(item.quantity_received || 0);
    };

    const handleSubmit = async () => {
        const itemsToReceive = Object.entries(quantities)
            .filter(([, qty]) => parseFloat(qty) > 0)
            .map(([itemId, qty]) => ({
                item_id: parseInt(itemId),
                quantity_received: parseFloat(qty),
            }));

        if (itemsToReceive.length === 0) {
            toast.error('Aucune quantité à réceptionner.');
            return;
        }

        if (destinationType === 'warehouse' && !warehouseId) {
            toast.error("Veuillez sélectionner un entrepôt.");
            return;
        }

        setIsSubmitting(true);
        const result = await receiveItems(order.id, itemsToReceive, destinationType, warehouseId);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Réception effectuée.');
            onClose();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Réceptionner des articles</DialogTitle>
                    <p className="text-sm text-gray-500">{order?.order_number} • {order?.supplier_name}</p>
                </DialogHeader>

                <div className="space-y-3">
                    {/* Choix de la destination */}
                    {warehouses.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4 space-y-3">
                            <label className="text-sm font-medium text-blue-900 block">Destination de la réception</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="dest" checked={destinationType === 'shop'} onChange={() => setDestinationType('shop')} />
                                    Boutique
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="radio" name="dest" checked={destinationType === 'warehouse'} onChange={() => setDestinationType('warehouse')} />
                                    Entrepôt
                                </label>
                            </div>
                            
                            {destinationType === 'warehouse' && (
                                <select 
                                    className="w-full text-sm p-2 rounded border"
                                    value={warehouseId}
                                    onChange={e => setWarehouseId(e.target.value)}
                                >
                                    <option value="">Sélectionner un entrepôt...</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {items?.map((item) => {
                        const remaining = getRemaining(item);
                        if (remaining <= 0) return null;
                        return (
                            <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{item.product_name}</p>
                                    <p className="text-xs text-gray-400">
                                        Commandé: {item.quantity_ordered} • Déjà reçu: {item.quantity_received || 0} • Reste: {remaining}
                                    </p>
                                </div>
                                <div className="w-24">
                                    <Input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max={remaining}
                                        placeholder="Qté"
                                        value={quantities[item.id] || ''}
                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Réception...' : 'Valider la réception'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}