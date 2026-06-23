// app/restaurant/sales/new/page.jsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ProductGrid from '@/components/sales/POS/ProductGrid';
import CartPanel from '@/components/sales/POS/CartPanel';
import ClientSelector from '@/components/sales/POS/ClientSelector';
import PaymentSection from '@/components/sales/POS/PaymentSection';
import useCartStore from '@/store/cartStore';
import useRestaurantDishStore from '@/store/restaurantDishStore';
import useRestaurantSaleStore from '@/store/restaurantSaleStore';
import useCompanyStore from '@/store/companyStore';
import { cn } from '@/lib/utils';

export default function RestaurantPosPage() {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { dishes, fetchDishes } = useRestaurantDishStore();
  const { createSale } = useRestaurantSaleStore();
  const cart = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(true);
  const [itemNotes, setItemNotes] = useState({});

  useEffect(() => {
    if (activeCompany) fetchDishes();
    cart.clearCart();
    cart.setDiscount('none', 0);
  }, [activeCompany]);

  const handleAddToCart = useCallback((product) => {
    cart.addItem(product);
  }, []);

  const handleNoteChange = (productId, note) => {
    setItemNotes(prev => ({ ...prev, [productId]: note }));
  };

  const handleSubmit = async () => {
    if (!activeCompany || cart.items.length === 0) {
      toast.error('Le panier est vide.');
      return;
    }

    setIsSubmitting(true);
    const total = cart.getTotal();
    const payload = {
      company_id: activeCompany.id,
      client_id: cart.clientId || null,
      client_name: cart.clientName || null,
      items: cart.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        price_type: item.price_type,
        notes: itemNotes[item.product_id] || null,
      })),
      discount_type: cart.discountType,
      discount_value: cart.discountValue,
      payment_status: 'paid',
      amount_paid: cart.amountPaid,
      payment_method: cart.paymentMethod,
      payment_reference: cart.paymentReference || null,
      notes: null,
    };

    const result = await createSale(payload);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Commande validée !');
      cart.clearCart();
      fetchDishes();
    } else {
      toast.error(result.message);
    }
  };

  const itemsCount = cart.getItemsCount();
  const cartTotal = cart.getTotal();

  return (
    <div className="h-[calc(100vh-65px)] flex bg-gray-50">
      {/* Colonne gauche : Plats + Panier */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/restaurant/sales')}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="font-semibold text-lg">Nouvelle commande</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <ShoppingCart size={16} />
            <span>{itemsCount} plat{itemsCount > 1 ? 's' : ''}</span>
            {itemsCount > 0 && (
              <Badge variant="outline" className="font-bold">{cartTotal.toLocaleString()} FCFA</Badge>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ProductGrid products={dishes} onAddToCart={handleAddToCart} cartItems={cart.items} />
        </div>

        {itemsCount > 0 && (
          <div className="border-t bg-white shadow-lg shrink-0">
            <button
              onClick={() => setCartExpanded(!cartExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100"
            >
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ShoppingCart size={16} /> Panier ({itemsCount})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brand-700">{cartTotal.toLocaleString()} FCFA</span>
                {cartExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </div>
            </button>
            {cartExpanded && (
              <div className="max-h-[300px] overflow-y-auto">
                {/* Notes cuisine par article */}
                {cart.items.map((item) => (
                  <div key={item.product_id} className="px-4 py-2 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.product_name} ×{item.quantity}</span>
                      <span className="text-sm font-semibold">{(item.unit_price * item.quantity).toLocaleString()} F</span>
                    </div>
                    <Input
                      placeholder="Note cuisine (ex: bien cuit, sans sel...)"
                      value={itemNotes[item.product_id] || ''}
                      onChange={(e) => handleNoteChange(item.product_id, e.target.value)}
                      className="h-7 text-xs mt-1 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Colonne droite : Client + Paiement + Valider */}
      <div className="w-[380px] xl:w-[420px] border-l bg-white flex flex-col shrink-0 hidden lg:flex">
        <ClientSelector clientName={cart.clientName} onSetClient={cart.setClient} />

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

        <div className="p-4 border-t">
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

      {/* Mobile : bouton flottant */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
        <Button
          onClick={handleSubmit}
          className="w-full h-12 text-base font-semibold rounded-xl"
          disabled={isSubmitting || cart.items.length === 0 || cart.amountPaid < cartTotal}
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin mr-2" /> : `Valider • ${cartTotal.toLocaleString()} FCFA`}
        </Button>
      </div>
    </div>
  );
}