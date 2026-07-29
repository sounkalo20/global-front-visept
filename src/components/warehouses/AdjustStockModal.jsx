// components/warehouses/AdjustStockModal.jsx
'use client';
import { useState, useEffect } from 'react';
import { AlertCircle, Plus, Minus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useWarehouseStore from '@/store/warehouseStore';

const AdjustStockModal = ({ isOpen, onClose, stock, warehouseId, onSuccess }) => {
    const [quantity, setQuantity] = useState('');
    const [selectedReason, setSelectedReason] = useState('');
    const [notes, setNotes] = useState('');
    const [adjustmentType, setAdjustmentType] = useState('positive');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { adjustmentReasons, fetchAdjustmentReasons, adjustStock } = useWarehouseStore();

    // Charger les motifs à l'ouverture
    useEffect(() => {
        const loadReasons = async () => {
            if (isOpen) {
                console.log('🔄 Chargement des motifs...');
                const reasons = await fetchAdjustmentReasons();
                console.log('📋 Motifs chargés:', reasons);

                // Si un motif est déjà sélectionné mais pas dans la liste, le réinitialiser
                if (selectedReason && !reasons.some(r => r.code === selectedReason)) {
                    setSelectedReason('');
                }
            }
        };
        loadReasons();
    }, [isOpen]);

    // Réinitialiser le formulaire à l'ouverture
    useEffect(() => {
        if (isOpen) {
            setQuantity('');
            setSelectedReason('');
            setNotes('');
            setAdjustmentType('positive');
            setError(null);
        }
    }, [isOpen]);

    // Filtrer les motifs par type
    const getFilteredReasons = () => {
        const reasons = adjustmentReasons || [];
        console.log('🔍 Filtrage des motifs, type:', adjustmentType, 'reasons:', reasons);
        const filtered = reasons.filter(r => {
            if (adjustmentType === 'positive') {
                return r.type === 'positive' || r.type === 'both';
            } else {
                return r.type === 'negative' || r.type === 'both';
            }
        });
        console.log('✅ Motifs filtrés:', filtered);
        return filtered;
    };

    const getReasonLabel = (code) => {
        const reason = adjustmentReasons.find(r => r.code === code);
        return reason ? reason.label : code;
    };

    const handleSubmit = async () => {
        // Validations
        if (!quantity || parseFloat(quantity) <= 0) {
            setError('Veuillez entrer une quantité valide (supérieure à 0).');
            return;
        }

        if (!selectedReason) {
            setError('Veuillez sélectionner un motif.');
            return;
        }

        // Vérifier que le stock est suffisant pour une déduction
        if (adjustmentType === 'negative') {
            const currentStock = parseFloat(stock?.quantity || 0);
            if (parseFloat(quantity) > currentStock) {
                setError(`Stock insuffisant. Stock actuel : ${currentStock}`);
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            const finalQuantity = adjustmentType === 'positive'
                ? parseFloat(quantity)
                : -parseFloat(quantity);

            console.log('📦 Envoi ajustement:', {
                warehouseId,
                catalog_product_id: stock?.catalog_product_id,
                quantity: finalQuantity,
                reason: selectedReason,
                notes: notes || undefined
            });

            await adjustStock(warehouseId, {
                catalog_product_id: stock?.catalog_product_id,
                quantity: finalQuantity,
                reason: selectedReason,
                notes: notes || undefined
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('❌ Erreur ajustement:', err);
            setError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    const reasonOptions = getFilteredReasons();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ajustement de stock</DialogTitle>
                    <DialogDescription>
                        {stock?.product_name && (
                            <span className="font-medium text-gray-900 block mt-1">
                                Produit : {stock.product_name}
                            </span>
                        )}
                        {stock?.quantity !== undefined && (
                            <span className="text-sm text-gray-500 block">
                                Stock actuel : {stock.quantity} unités
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-3">
                    {/* Type d'ajustement */}
                    <div>
                        <Label className="text-sm font-medium mb-1.5 block">
                            Type d'ajustement
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant={adjustmentType === 'positive' ? 'default' : 'outline'}
                                className={adjustmentType === 'positive'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'border-gray-300'
                                }
                                onClick={() => {
                                    setAdjustmentType('positive');
                                    setSelectedReason(''); // Réinitialiser le motif
                                }}
                            >
                                <Plus size={16} className="mr-2" />
                                Ajouter
                            </Button>
                            <Button
                                type="button"
                                variant={adjustmentType === 'negative' ? 'default' : 'outline'}
                                className={adjustmentType === 'negative'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'border-gray-300'
                                }
                                onClick={() => {
                                    setAdjustmentType('negative');
                                    setSelectedReason(''); // Réinitialiser le motif
                                }}
                            >
                                <Minus size={16} className="mr-2" />
                                Déduire
                            </Button>
                        </div>
                    </div>

                    {/* Quantité */}
                    <div>
                        <Label htmlFor="quantity" className="text-sm font-medium mb-1.5 block">
                            Quantité
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Ex: 10"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Motif */}
                    <div>
                        <Label htmlFor="reason" className="text-sm font-medium mb-1.5 block">
                            Motif <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={selectedReason}
                            onValueChange={setSelectedReason}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner un motif" />
                            </SelectTrigger>
                            <SelectContent>
                                {reasonOptions.length === 0 ? (
                                    <div className="px-2 py-1 text-sm text-gray-500">
                                        Chargement des motifs...
                                    </div>
                                ) : (
                                    reasonOptions.map((reason) => (
                                        <SelectItem key={reason.code} value={reason.code}>
                                            {reason.label}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {selectedReason && (
                            <p className="text-xs text-gray-500 mt-1">
                                {adjustmentType === 'positive' ? 'Ajout' : 'Déduction'} de stock pour : {getReasonLabel(selectedReason)}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes" className="text-sm font-medium mb-1.5 block">
                            Notes (optionnel)
                        </Label>
                        <Input
                            id="notes"
                            type="text"
                            placeholder="Informations complémentaires..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Erreur */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={adjustmentType === 'positive' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                    >
                        {isLoading ? 'Traitement...' : (
                            adjustmentType === 'positive' ? 'Ajouter' : 'Déduire'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AdjustStockModal;