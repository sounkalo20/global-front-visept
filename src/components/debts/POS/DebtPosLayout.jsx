// app/shop/sales/new/debt-layout.jsx (REMPLACER)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, User, Check, X, ShoppingCart, Calendar, Wallet, CreditCard, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  const [dueDate, setDueDate] = useState(() => {
    // Par défaut : dans 30 jours
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState(0);
  const [cartExpanded, setCartExpanded] = useState(true);

  useEffect(() => {
    if (activeCompany) fetchProducts(activeCompany.id);
    cart.clearCart();
    cart.setDiscount('none', 0);
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
    if (!activeCompany || cart.items.length === 0) {
      toast.error('Le panier est vide.');
      return;
    }
    if (!selectedClient) {
      toast.error('Un client est obligatoire pour une vente à crédit.');
      return;
    }

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
      setDiscountType('none');
      setDiscountValue(0);
      if (activeCompany) fetchProducts(activeCompany.id);
      router.push('/shop/debts');
    } else {
      toast.error(result.message);
    }
  };

  const itemsCount = cart.getItemsCount();
  const cartTotal = cart.getTotal();

  return (
    <div className="h-[calc(100vh-65px)] flex bg-gray-50">
      {/* ======================== */}
      {/* COLONNE GAUCHE : Produits + Panier */}
      {/* ======================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/restaurant/debts')}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg flex items-center gap-2">
                <CreditCard size={20} className="text-amber-600" />
                Vente à crédit
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <ShoppingCart size={16} />
            <span>{itemsCount} article{itemsCount > 1 ? 's' : ''}</span>
            {itemsCount > 0 && (
              <Badge variant="outline" className="font-bold">
                {cartTotal.toLocaleString()} FCFA
              </Badge>
            )}
          </div>
        </header>

        {/* Zone produits */}
        <div className="flex-1 overflow-hidden">
          <ProductGrid products={products} onAddToCart={handleAddToCart} cartItems={cart.items} />
        </div>

        {/* Zone panier (en bas) */}
        {itemsCount > 0 && (
          <div className="border-t bg-white shadow-lg shrink-0">
            <button
              onClick={() => setCartExpanded(!cartExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ShoppingCart size={16} />
                Panier ({itemsCount})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brand-700">{cartTotal.toLocaleString()} FCFA</span>
                {cartExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </div>
            </button>

            {cartExpanded && (
              <div className="max-h-[300px] overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <CartPanel
                    items={cart.items}
                    onUpdateQuantity={handleUpdateQuantity}
                    onUpdatePrice={handleUpdatePrice}
                    onRemoveItem={handleRemoveItem}
                    subtotal={cart.getSubtotal()}
                    discountAmount={cart.getDiscountAmount()}
                    total={cartTotal}
                    compact
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================== */}
      {/* COLONNE DROITE : Client + Remise + Paiement + Valider */}
      {/* ======================== */}
      <div className="w-[380px] xl:w-[420px] border-l bg-white flex flex-col shrink-0 hidden lg:flex">
        {/* Client obligatoire */}
        <div className="border-b bg-amber-50/50">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <User size={14} />
              Client obligatoire
            </p>

            {selectedClient ? (
              <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <User size={20} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{selectedClient.full_name}</p>
                    {selectedClient.phone && (
                      <p className="text-xs text-gray-500">{selectedClient.phone}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedClient(null);
                    cart.setClient(null, null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  <X size={14} className="mr-1" /> Changer
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-amber-200 p-3">
                <ClientQuickSelector
                  onSelect={(client) => {
                    setSelectedClient(client);
                    cart.setClient(client?.id || null, client?.full_name || null);
                  }}
                  selectedClient={null}
                />
              </div>
            )}
          </div>
        </div>

        {/* Paramètres de la dette */}
        <div className="border-b px-4 py-4 space-y-4">
          {/* Date d'échéance */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
              <Calendar size={14} />
              Date d'échéance
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-10 text-sm rounded-xl"
            />
            <p className="text-xs text-gray-400 mt-1">
              Date limite de paiement pour le client
            </p>
          </div>

          {/* Remise */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              🏷️ Remise
            </label>
            <div className="flex items-center gap-1 mb-2">
              {[
                { key: 'none', label: 'Sans' },
                { key: 'percentage', label: '%' },
                { key: 'fixed', label: 'Fixe' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setDiscountType(opt.key)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${discountType === opt.key
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {discountType !== 'none' && (
              <Input
                type="number"
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder={discountType === 'percentage' ? 'Pourcentage' : 'Montant FCFA'}
                className="h-9 text-sm rounded-xl"
                min="0"
              />
            )}
          </div>
        </div>

        {/* Paiement initial */}
        <div className="border-b px-4 py-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
            <Wallet size={14} />
            Paiement initial (optionnel)
          </p>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { key: 'cash', label: 'Espèces', icon: '💵' },
              { key: 'mobile_money', label: 'Mobile', icon: '📱' },
              { key: 'bank_transfer', label: 'Virement', icon: '🏦' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => cart.setPaymentMethod(m.key)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-colors ${cart.paymentMethod === m.key
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <span className="text-base">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Input
              type="number"
              value={cart.amountPaid || ''}
              onChange={(e) => cart.setAmountPaid(parseFloat(e.target.value) || 0)}
              placeholder="Montant payé"
              className="h-11 text-lg font-semibold rounded-xl pr-16"
              min="0"
            />
            <button
              type="button"
              onClick={() => cart.setAmountPaid(cartTotal)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-lg font-medium hover:bg-brand-200 transition-colors"
            >
              Total
            </button>
          </div>

          {cart.paymentMethod !== 'cash' && (
            <Input
              placeholder="Référence de transaction"
              value={cart.paymentReference}
              onChange={(e) => cart.setPaymentReference(e.target.value)}
              className="h-9 text-sm rounded-xl"
            />
          )}

          {cart.amountPaid > 0 && (
            <div className="flex items-center justify-between bg-blue-50 rounded-xl p-3">
              <span className="text-sm text-blue-700">Reste à payer</span>
              <span className="text-lg font-bold text-blue-700">
                {Math.max(0, cartTotal - cart.amountPaid).toLocaleString()} FCFA
              </span>
            </div>
          )}
        </div>

        {/* Bouton Valider */}
        <div className="p-4 mt-auto">
          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-semibold rounded-xl"
            disabled={isSubmitting || cart.items.length === 0 || !selectedClient}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Création en cours...
              </>
            ) : !selectedClient ? (
              'Sélectionnez un client'
            ) : cart.items.length === 0 ? (
              'Panier vide'
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Créer la dette • {cartTotal.toLocaleString()} FCFA
              </>
            )}
          </Button>
          {!selectedClient && (
            <p className="text-xs text-red-500 text-center mt-2">
              ⚠️ Un client est obligatoire pour une vente à crédit
            </p>
          )}
        </div>
      </div>

      {/* Mobile : bouton valider flottant */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
        <Button
          onClick={handleSubmit}
          className="w-full h-12 text-base font-semibold rounded-xl"
          disabled={isSubmitting || cart.items.length === 0 || !selectedClient}
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin mr-2" />
          ) : !selectedClient ? (
            'Sélectionnez un client'
          ) : (
            <>Créer la dette • {cartTotal.toLocaleString()} FCFA</>
          )}
        </Button>
      </div>
    </div>
  );
}