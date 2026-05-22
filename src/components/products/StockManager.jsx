'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Minus, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useProductStore from '@/store/productStore';
import useCompanyStore from '@/store/companyStore';

export default function StockManager({ product, onClose }) {
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateStock } = useProductStore();
  const { activeCompany } = useCompanyStore();

  const handleStockAction = async (type, qty = null) => {
    const finalQty = qty !== null ? qty : parseInt(quantity);
    if (!finalQty || finalQty <= 0) {
      toast.error('Veuillez entrer une quantité valide.');
      return;
    }

    setIsSubmitting(true);
    const movementType = type === 'add' ? 'purchase' : type === 'remove' ? 'loss' : type;

    const result = await updateStock(product.id, activeCompany.id, {
      quantity: finalQty,
      movement_type: movementType,
      note: `Ajustement manuel`,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Stock mis à jour.');
      onClose?.();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Stock actuel :{' '}
        <span className="font-semibold text-gray-900">
          {product.current_stock} {product.unit_symbol || 'pcs'}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          placeholder="Quantité"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-24 text-center"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleStockAction('add')}
          disabled={isSubmitting}
          className="text-green-600 border-green-300 hover:bg-green-50"
        >
          <Plus size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleStockAction('remove')}
          disabled={isSubmitting}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <Minus size={16} />
        </Button>
      </div>

      <div className="flex gap-2">
        {[1, 5, 10, 20].map((qty) => (
          <Button
            key={qty}
            variant="outline"
            size="sm"
            onClick={() => handleStockAction('add', qty)}
            disabled={isSubmitting}
            className="text-xs"
          >
            +{qty}
          </Button>
        ))}
      </div>
    </div>
  );
}