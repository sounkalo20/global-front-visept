'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, User, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductGrid from '@/components/sales/POS/ProductGrid';
import CartPanel from '@/components/sales/POS/CartPanel';
import ClientQuickSelector from '@/components/clients/ClientQuickSelector';
import useCartStore from '@/store/cartStore';
import useProductStore from '@/store/productStore';
import useDebtStore from '@/store/debtStore';
import useCompanyStore from '@/store/companyStore';

export default function DebtPosLayout() {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { products, fetchProducts } = useProductStore();
  const { createDebt } = useDebtStore();
  const cart = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    if (activeCompany) fetchProducts(activeCompany.id);
    cart.clearCart();
  }, [activeCompany]);

  const handleAddToCart = useCallback((product) => cart.addItem(product), []);
  const handleUpdateQuantity = useCallback((pId, qty) => cart.updateQuantity(pId, qty), []);
  const handleUpdatePrice = useCallback((pId, price, priceType) => cart.updateUnitPrice(pId, price, priceType), []);
  const handleRemoveItem = useCallback((pId) => cart.removeItem(pId), []);

  // Synchroniser la remise avec le cartStore
  useEffect(() => {
    cart.setDiscount(discountType, discountValue);
  }, [discountType, discountValue]);

  const handleSubmit = async () => {
    if (!activeCompany || cart.items.length === 0) { toast.error('Le panier est vide.'); return; }
    if (!selectedClient) { toast.error('Un client est obligatoire pour une vente à crédit.'); return; }

    setIsSubmitting(true);
    const total = cart.getTotal();
    const payload = {
      company_id: activeCompany.id,
      client_id: selectedClient.id,
      sale_id: null,
      total_amount: total,
      due_date: dueDate || null,
      notes: cart.notes || null,
      amount_paid: cart.amountPaid || 0,
      payment_method: cart.paymentMethod || 'cash',
      payment_reference: cart.paymentReference || null,
      discount_type: discountType,
      discount_value: discountType !== 'none' ? discountValue : 0,
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        price_type: item.price_type,
      })),
    };

    const result = await createDebt(payload);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Vente à crédit créée avec succès !');
      cart.clearCart();
      setSelectedClient(null);
      setDueDate('');
      setDiscountType('none');
      setDiscountValue(0);
      if (activeCompany) fetchProducts(activeCompany.id);
      router.push('/dashboard/debts');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/debts')} className="h-8 w-8"><ArrowLeft size={18} /></Button>
          <h1 className="font-semibold text-lg">Vente à crédit</h1>
        </div>
        <div className="text-sm text-gray-500">{cart.getItemsCount()} article(s)</div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Produits */}
        <div className="w-full lg:w-3/5 xl:w-2/3 border-r flex flex-col bg-white overflow-hidden">
          <ProductGrid products={products} onAddToCart={handleAddToCart} cartItems={cart.items} />
        </div>

        {/* Panier + Paiement */}
        <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col bg-white overflow-hidden">
          {/* Client obligatoire - CORRIGÉ : affichage clair */}
          <div className="px-4 py-3 border-b bg-amber-50">
            <p className="text-xs font-medium text-amber-700 mb-2">👤 Client obligatoire</p>
            {selectedClient ? (
              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-200">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-brand-100 p-1"><Check size={14} className="text-brand-600" /></div>
                  <div>
                    <p className="text-sm font-medium">{selectedClient.full_name}</p>
                    <p className="text-xs text-gray-500">{selectedClient.phone}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedClient(null); cart.setClient(null, null); }} className="text-xs h-7 text-red-500">
                  <X size={14} className="mr-1" /> Changer
                </Button>
              </div>
            ) : (
              <ClientQuickSelector
                onSelect={(client) => {
                  setSelectedClient(client);
                  cart.setClient(client?.id || null, client?.full_name || null);
                }}
                selectedClient={null}
              />
            )}
          </div>

          {/* Date d'échéance */}
          <div className="px-4 py-2 border-b flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">📅 Échéance :</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-8 text-xs w-40" />
          </div>

          {/* Remise (DISCOUNT) - CORRIGÉ : ajouté */}
          <div className="px-4 py-2 border-b flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">🏷 Remise :</label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="h-8 text-xs border rounded px-2">
              <option value="none">Aucune</option>
              <option value="percentage">%</option>
              <option value="fixed">Fixe</option>
            </select>
            {discountType !== 'none' && (
              <Input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder={discountType === 'percentage' ? '%' : 'FCFA'}
                className="h-8 w-20 text-xs"
              />
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <CartPanel
              items={cart.items}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdatePrice={handleUpdatePrice}
              onRemoveItem={handleRemoveItem}
              subtotal={cart.getSubtotal()}
              discountAmount={cart.getDiscountAmount()}
              total={cart.getTotal()}
            />
          </div>

          {/* Paiement initial */}
          <div className="border-t bg-white p-4 space-y-3">
            <p className="text-xs font-medium text-gray-600">💵 Montant payé (optionnel)</p>
            <div className="flex gap-1">
              {['cash', 'mobile_money', 'bank_transfer'].map((m) => (
                <button
                  key={m}
                  onClick={() => cart.setPaymentMethod(m)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                    cart.paymentMethod === m ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {m === 'cash' ? '💵 Cash' : m === 'mobile_money' ? '📱 Mobile' : '🏦 Virement'}
                </button>
              ))}
            </div>
            <Input
              type="number"
              value={cart.amountPaid || ''}
              onChange={(e) => cart.setAmountPaid(parseFloat(e.target.value) || 0)}
              placeholder="Montant payé"
              className="h-9 text-sm"
            />
            {cart.paymentMethod !== 'cash' && (
              <Input
                placeholder="Référence transaction"
                value={cart.paymentReference}
                onChange={(e) => cart.setPaymentReference(e.target.value)}
                className="h-8 text-xs"
              />
            )}
          </div>

          {/* Bouton valider */}
          <div className="p-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || cart.items.length === 0 || !selectedClient}
              className="w-full h-12 text-base font-semibold"
            >
              {isSubmitting ? (
                <><Loader2 size={20} className="animate-spin mr-2" /> Création...</>
              ) : (
                `Créer la dette • ${cart.getTotal().toLocaleString()} FCFA`
              )}
            </Button>
            {!selectedClient && (
              <p className="text-xs text-red-500 text-center mt-1">Veuillez sélectionner un client</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}