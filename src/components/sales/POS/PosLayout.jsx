'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import ClientSelector from './ClientSelector';
import PaymentSection from './PaymentSection';
import useCartStore from '@/store/cartStore';
import useProductStore from '@/store/productStore';
import useSaleStore from '@/store/saleStore';
import useCompanyStore from '@/store/companyStore';

export default function PosLayout({ mode = 'create', saleId = null }) {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { products, fetchProducts } = useProductStore();
  const { createSale, updateSale, fetchSaleById, currentSale } = useSaleStore();
  const cart = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSale, setIsLoadingSale] = useState(false);

  const isEditMode = mode === 'edit';

  // Charger les produits
  useEffect(() => {
    if (activeCompany) fetchProducts(activeCompany.id);
  }, [activeCompany]);

  // En mode édition, charger la vente existante
  useEffect(() => {
    if (isEditMode && saleId && activeCompany) {
      setIsLoadingSale(true);
      fetchSaleById(saleId, activeCompany.id).then((sale) => {
        if (sale) {
          cart.loadFromSale(sale);
        }
        setIsLoadingSale(false);
      });
    }
  }, [isEditMode, saleId, activeCompany]);

  const handleAddToCart = useCallback((product) => {
    cart.addItem(product);
  }, []);

  const handleUpdateQuantity = useCallback((productId, qty) => {
    cart.updateQuantity(productId, qty);
  }, []);

  const handleUpdatePrice = useCallback((productId, price, priceType = null) => {
    if (priceType) {
      // Si un type de prix est spécifié, mettre à jour le prix ET le type
      cart.updateUnitPrice(productId, price, priceType);
    } else {
      // Sinon, juste mettre à jour le prix
      cart.updateUnitPrice(productId, price);
    }
  }, []);

  const handleRemoveItem = useCallback((productId) => {
    cart.removeItem(productId);
  }, []);

  const handleSubmit = async () => {
    if (!activeCompany || cart.items.length === 0) {
      toast.error('Le panier est vide.');
      return;
    }

    setIsSubmitting(true);

    let result;
    if (isEditMode) {
      const payload = cart.getUpdatePayload(activeCompany.id);
      result = await updateSale(saleId, payload);
    } else {
      const payload = cart.getPayload(activeCompany.id);
      result = await createSale(payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEditMode ? 'Vente modifiée avec succès !' : 'Vente validée avec succès !');
      cart.clearCart();
      if (activeCompany) fetchProducts(activeCompany.id);
      // router.push(`/dashboard/sales/${result.sale.id}`);
    } else {
      toast.error(result.message);
    }
  };

  if (isLoadingSale) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(isEditMode ? `/dashboard/sales/${saleId}` : '/dashboard/sales')}
            className="h-8 w-8"
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="font-semibold text-lg">
            {isEditMode ? 'Modifier la vente' : 'Nouvelle vente'}
          </h1>
          {isEditMode && currentSale && (
            <span className="text-sm text-gray-400 ml-2">{currentSale.sale_number}</span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {cart.getItemsCount()} article(s)
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Colonne gauche - Produits */}
        <div className="w-full lg:w-3/5 xl:w-2/3 border-r flex flex-col bg-white overflow-hidden">
          <ProductGrid
            products={products}
            onAddToCart={handleAddToCart}
            cartItems={cart.items}
          />
        </div>

        {/* Colonne droite - Panier + Paiement */}
        <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col bg-white overflow-hidden">
          <ClientSelector
            clientName={cart.clientName}
            onSetClient={cart.setClient}
          />

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
            total={cart.getTotal()}
          />

          {/* Bouton valider / enregistrer */}
          <div className="p-4 border-t">
            <Button
              onClick={handleSubmit}
              className="w-full h-12 text-base font-semibold"
              disabled={
                isSubmitting ||
                cart.items.length === 0 ||
                cart.amountPaid < cart.getTotal()
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  {isEditMode ? 'Enregistrement...' : 'Validation...'}
                </>
              ) : isEditMode ? (
                <>
                  <Save size={20} className="mr-2" />
                  Enregistrer les modifications
                </>
              ) : cart.amountPaid < cart.getTotal() ? (
                <span className="text-red-200">
                  Montant insuffisant
                </span>
              ) : (
                `Valider • ${cart.getTotal().toLocaleString()} FCFA`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}