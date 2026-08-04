'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Percent, Banknote, Smartphone, Building2, CreditCard, Plus, Trash2 } from 'lucide-react';

export default function PaymentSection({
  payments,
  onPaymentsChange,
  discountType,
  onDiscountChange,
  discountValue,
  onDiscountValueChange,
  total,
}) {
  const paymentMethods = [
    { key: 'cash', label: 'Espèces', icon: Banknote },
    { key: 'mobile_money', label: 'Mobile', icon: Smartphone },
    { key: 'card', label: 'Carte', icon: CreditCard },
    { key: 'bank_transfer', label: 'Virement', icon: Building2 },
  ];

  const discountOptions = [
    { key: 'none', label: 'Sans remise' },
    { key: 'percentage', label: '%' },
    { key: 'fixed', label: 'FCFA' },
  ];

  const amountPaid = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
  const change = Math.max(0, amountPaid - total);

  // Initialiser avec un paiement par défaut si vide
  useEffect(() => {
    if (!payments || payments.length === 0) {
      onPaymentsChange([{ method: 'cash', amount: total > 0 ? total : 0, reference: '' }]);
    }
  }, [payments, total]);

  const handleDiscountTypeChange = (type) => {
    onDiscountChange(type, type === 'none' ? 0 : discountValue);
  };

  const handleDiscountValueChange = (value) => {
    onDiscountValueChange(parseFloat(value) || 0);
  };

  const addPaymentLine = () => {
    onPaymentsChange([...payments, { method: 'mobile_money', amount: 0, reference: '' }]);
  };

  const removePaymentLine = (index) => {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    onPaymentsChange(newPayments);
  };

  const updatePayment = (index, field, value) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    onPaymentsChange(newPayments);
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
              {opt.label}
            </button>
          ))}
        </div>
        {discountType !== 'none' && (
          <div className="mt-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Percent size={14} className="text-gray-400" />
            </div>
            <Input
              type="number"
              min="0"
              value={discountValue || ''}
              onChange={(e) => handleDiscountValueChange(e.target.value)}
              className="pl-9 bg-white"
              placeholder={`Valeur (${discountType === 'percentage' ? '%' : 'FCFA'})`}
            />
          </div>
        )}
      </div>

      {/* Paiements Multiples */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500">Paiements (Règlements)</label>
          <Button variant="ghost" size="sm" onClick={addPaymentLine} className="h-6 text-xs text-blue-600">
            <Plus size={12} className="mr-1" /> Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {payments.map((payment, index) => (
            <div key={index} className="p-3 border rounded-lg bg-gray-50 relative">
              {payments.length > 1 && (
                <button 
                  onClick={() => removePaymentLine(index)}
                  className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                >
                  <Trash2 size={12} />
                </button>
              )}
              
              <div className="flex gap-2 mb-2">
                {paymentMethods.map(method => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.key}
                      onClick={() => updatePayment(index, 'method', method.key)}
                      className={cn(
                        'flex-1 py-1.5 px-2 rounded flex flex-col items-center justify-center border',
                        payment.method === method.key
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                      )}
                    >
                      <Icon size={14} className="mb-0.5" />
                      <span className="text-[10px]">{method.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Montant"
                    value={payment.amount === 0 ? '' : payment.amount}
                    onChange={(e) => updatePayment(index, 'amount', parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                {['mobile_money', 'bank_transfer'].includes(payment.method) && (
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Réf."
                      value={payment.reference || ''}
                      onChange={(e) => updatePayment(index, 'reference', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                )}
              </div>
              
              {/* Bouton pour ajuster au reste à payer */}
              {index === payments.length - 1 && amountPaid < total && (
                <button 
                  className="text-[10px] text-blue-500 mt-1 hover:underline"
                  onClick={() => updatePayment(index, 'amount', payment.amount + (total - amountPaid))}
                >
                  Ajuster au reste à payer ({total - amountPaid} F)
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Résumé */}
      <div className="pt-4 border-t space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Net à payer</span>
          <span className="font-semibold text-gray-900">{total.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Total Encaissé</span>
          <span className={cn("font-semibold", amountPaid < total ? "text-red-500" : "text-green-600")}>
            {amountPaid.toLocaleString()} FCFA
          </span>
        </div>
        {change > 0 && (
          <div className="flex justify-between items-center text-orange-600 font-medium bg-orange-50 p-2 rounded-lg">
            <span>Rendu Monnaie</span>
            <span>{change.toLocaleString()} FCFA</span>
          </div>
        )}
      </div>
    </div>
  );
}