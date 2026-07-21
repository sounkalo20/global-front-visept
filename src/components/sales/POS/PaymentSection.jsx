// app/shop/sales/new/PaymentSection.jsx (REMPLACER)
'use client';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Percent, Banknote, Smartphone, Building2, Wallet, Check } from 'lucide-react';

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

  const paymentMethods = [
    { key: 'cash', label: 'Espèces', icon: Banknote },
    { key: 'mobile_money', label: 'Mobile', icon: Smartphone },
    { key: 'bank_transfer', label: 'Virement', icon: Building2 },
  ];

  const discountOptions = [
    { key: 'none', label: 'Sans remise' },
    { key: 'percentage', label: '%' },
    { key: 'fixed', label: 'FCFA' },
  ];

  const handleDiscountTypeChange = (type) => {
    // Réinitialiser la valeur quand on change de type
    onDiscountChange(type, type === 'none' ? 0 : discountValue);
  };

  const handleDiscountValueChange = (value) => {
    onDiscountValueChange(parseFloat(value) || 0);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Remise */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-2 block">Remise</label>
        <div className="flex items-center gap-1">
          {discountOptions.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleDiscountTypeChange(opt.key)}
              className={cn(
                'flex-1 py-2 text-xs font-medium rounded-lg border transition-all duration-200 flex items-center justify-center gap-1',
                discountType === opt.key
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              )}
            >
              {discountType === opt.key && <Check size={12} className="shrink-0" />}
              {opt.key === 'percentage' && <Percent size={12} className="inline" />}
              {opt.label}
            </button>
          ))}
        </div>
        {discountType !== 'none' && (
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="number"
              value={discountValue || ''}
              onChange={(e) => handleDiscountValueChange(e.target.value)}
              className="h-9 text-sm rounded-lg"
              placeholder={discountType === 'percentage' ? 'Pourcentage' : 'Montant FCFA'}
              min="0"
              step={discountType === 'percentage' ? '1' : '0.01'}
            />
            <span className="text-xs text-gray-400 shrink-0">
              {discountType === 'percentage' ? '%' : 'FCFA'}
            </span>
          </div>
        )}
      </div>

      {/* Méthode de paiement */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-2 block">Paiement</label>
        <div className="grid grid-cols-3 gap-1.5">
          {paymentMethods.map(m => (
            <button
              key={m.key}
              type="button"
              onClick={() => onPaymentMethodChange(m.key)}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 relative',
                paymentMethod === m.key
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              )}
            >
              {paymentMethod === m.key && <Check size={10} className="absolute top-1 right-1" />}
              <m.icon size={18} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Référence */}
      {paymentMethod !== 'cash' && (
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Référence de transaction
          </label>
          <Input
            placeholder="N° de transaction"
            value={paymentReference}
            onChange={(e) => onPaymentReferenceChange(e.target.value)}
            className="h-9 text-sm rounded-lg"
          />
        </div>
      )}

      {/* Montant versé */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">
          Montant versé
        </label>
        <div className="relative">
          <Input
            type="number"
            value={amountPaid || ''}
            onChange={(e) => onAmountPaidChange(parseFloat(e.target.value) || 0)}
            className="h-11 text-lg font-semibold rounded-xl pr-16"
            min="0"
          />
          <button
            type="button"
            onClick={() => onAmountPaidChange(total)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-lg font-medium hover:bg-brand-200 transition-colors"
          >
            Total
          </button>
        </div>
      </div>

      {/* Monnaie */}
      {change > 0 && (
        <div className="flex items-center justify-between bg-green-50 rounded-xl p-3">
          <span className="text-sm text-green-700 flex items-center gap-1.5">
            <Wallet size={16} />
            Monnaie à rendre
          </span>
          <span className="text-lg font-bold text-green-700">{change.toLocaleString()} FCFA</span>
        </div>
      )}
    </div>
  );
}