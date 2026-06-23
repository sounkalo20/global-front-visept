// app/shop/sales/new/pos-layout.jsx (REMPLACER)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import ClientSelector from './ClientSelector';
import PaymentSection from './PaymentSection';
import useCartStore from '@/store/cartStore';
import useProductStore from '@/store/productStore';
import useSaleStore from '@/store/saleStore';
import useCompanyStore from '@/store/companyStore';

export default function PosLayout({ mode = 'create', saleId = null, backLink }) {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { products, fetchProducts } = useProductStore();
  const { createSale, updateSale, fetchSaleById, currentSale } = useSaleStore();
  const cart = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSale, setIsLoadingSale] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(true);

  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (activeCompany) fetchProducts(activeCompany.id);
  }, [activeCompany]);

  useEffect(() => {
    if (isEditMode && saleId && activeCompany) {
      setIsLoadingSale(true);
      fetchSaleById(saleId, activeCompany.id).then((sale) => {
        if (sale) cart.loadFromSale(sale);
        setIsLoadingSale(false);
      });
    }
  }, [isEditMode, saleId, activeCompany]);

  const handleAddToCart = useCallback((product) => {
    cart.addItem(product);
  }, []);

  const handleSubmit = async () => {
    if (!activeCompany || cart.items.length === 0) {
      toast.error('Le panier est vide.');
      return;
    }

    setIsSubmitting(true);
    const payload = isEditMode ? cart.getUpdatePayload(activeCompany.id) : cart.getPayload(activeCompany.id);
    const result = isEditMode ? await updateSale(saleId, payload) : await createSale(payload);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEditMode ? 'Vente modifiée !' : 'Vente validée !');
      cart.clearCart();
      if (activeCompany) fetchProducts(activeCompany.id);
    } else {
      toast.error(result.message);
    }
  };

  if (isLoadingSale) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    );
  }

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
              onClick={() => router.push(isEditMode ? `${backLink}/${saleId}` : `${backLink}`)}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg">
                {isEditMode ? 'Modifier la vente' : 'Nouvelle vente'}
              </h1>
              {isEditMode && currentSale && (
                <span className="text-xs text-gray-400">{currentSale.sale_number}</span>
              )}
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
            {/* Toggle panier */}
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
                    onUpdateQuantity={cart.updateQuantity}
                    onUpdatePrice={cart.updateUnitPrice}
                    onRemoveItem={cart.removeItem}
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
      {/* COLONNE DROITE : Client + Paiement + Valider */}
      {/* ======================== */}
      <div className="w-[380px] xl:w-[420px] border-l bg-white flex flex-col shrink-0 hidden lg:flex">
        {/* Client */}
        <ClientSelector
          clientName={cart.clientName}
          onSetClient={cart.setClient}
        />

        {/* Paiement */}
        <div className="flex-1 overflow-y-auto">
          <PaymentSection
            paymentMethod={cart.paymentMethod}
            onPaymentMethodChange={cart.setPaymentMethod}
            amountPaid={cart.amountPaid}
            onAmountPaidChange={cart.setAmountPaid}
            paymentReference={cart.paymentReference}
            onPaymentReferenceChange={cart.setPaymentReference}
            discountType={cart.discountType}
            onDiscountChange={cart.setDiscount}
            discountValue={cart.discountValue}
            onDiscountValueChange={(v) => cart.setDiscount(cart.discountType, v)}
            total={cartTotal}
          />
        </div>

        {/* Bouton Valider */}
        <div className="p-4 border-t bg-white">
          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base font-semibold rounded-xl"
            disabled={isSubmitting || cart.items.length === 0 || cart.amountPaid < cartTotal}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin mr-2" />
            ) : cart.items.length === 0 ? (
              'Panier vide'
            ) : cart.amountPaid < cartTotal ? (
              `Montant insuffisant • Manque ${(cartTotal - cart.amountPaid).toLocaleString()} FCFA`
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Valider • {cartTotal.toLocaleString()} FCFA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile : bouton valider flottant */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
        <Button
          onClick={handleSubmit}
          className="w-full h-12 text-base font-semibold rounded-xl"
          disabled={isSubmitting || cart.items.length === 0 || cart.amountPaid < cartTotal}
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin mr-2" />
          ) : cart.items.length === 0 ? (
            'Panier vide'
          ) : cart.amountPaid < cartTotal ? (
            `Montant insuffisant • Manque ${(cartTotal - cart.amountPaid).toLocaleString()} FCFA`
          ) : (
            <>
              <Save size={18} className="mr-2" />
              Valider • {cartTotal.toLocaleString()} FCFA
            </>
          )}
        </Button>
      </div>
    </div>
  );
}