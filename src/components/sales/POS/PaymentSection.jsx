'use client';

import { Input } from '@/components/ui/input';

export default function PaymentSection({
  paymentMethod,
  onPaymentMethodChange,
  amountPaid,
  onAmountPaidChange,
  paymentReference,
  onPaymentReferenceChange,
  discountType,
  onDiscountChange,
  discountValue,
  onDiscountValueChange,
  total,
}) {
  const change = Math.max(0, amountPaid - total);

  return (
    <div className="border-t bg-white p-4 space-y-3">

      {/* REMISE */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => onDiscountChange('none', 0)}
          className={`px-2 py-1 border rounded ${
            discountType === 'none' ? 'bg-black text-white' : ''
          }`}
        >
          Aucune
        </button>

        <button
          onClick={() => onDiscountChange('percentage', discountValue)}
          className={`px-2 py-1 border rounded ${
            discountType === 'percentage' ? 'bg-black text-white' : ''
          }`}
        >
          %
        </button>

        <button
          onClick={() => onDiscountChange('fixed', discountValue)}
          className={`px-2 py-1 border rounded ${
            discountType === 'fixed' ? 'bg-black text-white' : ''
          }`}
        >
          FCFA
        </button>

        {discountType !== 'none' && (
          <Input
            type="number"
            value={discountValue}
            onChange={(e) =>
              onDiscountValueChange(parseFloat(e.target.value) || 0)
            }
            className="h-8 w-24 text-xs"
          />
        )}
      </div>

      {/* MÉTHODE */}
      <div className="flex gap-1">
        {[
          { key: 'cash', label: '💵 Cash' },
          { key: 'mobile_money', label: '📱 Mobile' },
          { key: 'bank_transfer', label: '🏦 Virement' },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => onPaymentMethodChange(m.key)}
            className={`flex-1 py-2 text-xs rounded border ${
              paymentMethod === m.key
                ? 'bg-black text-white'
                : 'bg-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* RÉFÉRENCE */}
      {paymentMethod !== 'cash' && (
        <Input
          placeholder="Référence"
          value={paymentReference}
          onChange={(e) => onPaymentReferenceChange(e.target.value)}
          className="h-8 text-xs"
        />
      )}

      {/* MONTANT VERSÉ */}
      <div>
        <label className="text-xs text-gray-500">
          Montant versé
        </label>

        <Input
          type="number"
          value={amountPaid}
          onChange={(e) =>
            onAmountPaidChange(parseFloat(e.target.value) || 0)
          }
          className="h-9 text-sm"
        />
      </div>

      {/* MONNAIE */}
      <div className="flex justify-between text-sm bg-gray-50 p-2 rounded">
        <span>Monnaie à rendre</span>
        <span className="font-bold text-green-600">
          {change.toLocaleString()} FCFA
        </span>
      </div>
    </div>
  );
}