'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send, Receipt, CreditCard, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ProductGrid from '@/components/sales/POS/ProductGrid';
import ModifierSelectorModal from '@/components/restaurant/pos/ModifierSelectorModal';
import SplitBillModal from '@/components/restaurant/pos/SplitBillModal';
import OrderModeHeader from '@/components/restaurant/pos/OrderModeHeader';
import useRestaurantCartStore from '@/store/restaurantCartStore';
import useRestaurantDishStore from '@/store/restaurantDishStore';
import useRestaurantSaleStore from '@/store/restaurantSaleStore';
import useRestaurantModifierStore from '@/store/restaurantModifierStore';
import useCompanyStore from '@/store/companyStore';

export default function EditRestaurantSalePage() {
  const { id } = useParams();
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { dishes, fetchDishes } = useRestaurantDishStore();
  const { getSaleById, updateSale } = useRestaurantSaleStore();
  const { getDishModifiers } = useRestaurantModifierStore();
  const cart = useRestaurantCartStore();

  const [isLoadingSale, setIsLoadingSale] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [activeSale, setActiveSale] = useState(null);

  // Modificateurs state
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [selectedDishForModifiers, setSelectedDishForModifiers] = useState(null);
  const [dishModifierGroups, setDishModifierGroups] = useState([]);

  useEffect(() => {
    const loadSaleData = async () => {
      if (!activeCompany?.id || !id) return;
      setIsLoadingSale(true);
      fetchDishes();

      const res = await getSaleById(id);
      setIsLoadingSale(false);

      if (res.success && res.sale) {
        setActiveSale(res.sale);
        cart.clearCart();
        cart.setTableSession({
          tableId: res.sale.table_id,
          tableSessionId: res.sale.table_session_id,
        });

        // Charger les items existants dans le cart
        if (Array.isArray(res.sale.items)) {
          res.sale.items.forEach((item) => {
            cart.addItem(
              { id: item.product_id, name: item.product_name, retail_price: item.unit_price },
              item.quantity,
              item.notes || ''
            );
          });
        }
      } else {
        toast.error('Commande introuvable.');
        router.push('/restaurant/tables');
      }
    };

    loadSaleData();
  }, [activeCompany?.id, id]);

  const handleAddToCart = async (product) => {
    const res = await getDishModifiers(product.id);
    if (res.success && res.groups && res.groups.length > 0) {
      setSelectedDishForModifiers(product);
      setDishModifierGroups(res.groups);
      setModifierModalOpen(true);
    } else {
      cart.addItem(product);
      toast.success(`${product.name} ajouté !`);
    }
  };

  const handleConfirmModifiers = ({ product, quantity, unitPrice, extraPrice, modifierChoices }) => {
    cart.addItemWithModifiers(product, quantity, unitPrice, extraPrice, modifierChoices);
    toast.success(`${product.name} personnalisé ajouté !`);
  };

  const handleSaveUpdate = async () => {
    if (cart.items.length === 0) {
      toast.error('Le panier ne peut pas être vide.');
      return;
    }

    setIsSubmitting(true);
    const result = await updateSale(id, {
      company_id: activeCompany.id,
      items: cart.items,
      discount_type: cart.discountType,
      discount_value: cart.discountValue,
      notes: cart.notes,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Session de table mise à jour et envoyée en cuisine !');
      router.push('/restaurant/tables');
    } else {
      toast.error(result.message || 'Erreur lors de la mise à jour.');
    }
  };

  if (isLoadingSale) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 size={36} className="animate-spin text-amber-600 mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Chargement de la session de table...</p>
        </div>
      </div>
    );
  }

  const total = cart.getTotal();

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-gray-50">
      <OrderModeHeader />

      <div className="flex-1 flex min-h-0">
        {/* Colonne gauche : Grille des plats */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.push('/restaurant/tables')}>
                <ArrowLeft size={18} />
              </Button>
              <h2 className="font-bold text-gray-900 text-sm">
                Reprise Session Table #{activeSale?.table_id} ({activeSale?.sale_number})
              </h2>
            </div>
            <Badge className="bg-amber-100 text-amber-800 font-bold">
              En cours de service
            </Badge>
          </div>

          <div className="flex-1 overflow-hidden">
            <ProductGrid products={dishes} onAddToCart={handleAddToCart} cartItems={cart.items} />
          </div>
        </div>

        {/* Colonne droite : Récapitulatif Session & Plats */}
        <div className="w-[380px] xl:w-[420px] border-l bg-white flex flex-col shrink-0">
          <div className="p-3 border-b bg-gray-50 font-bold text-sm text-gray-800 flex items-center justify-between">
            <span>Articles de la Session</span>
            <span className="text-xs font-semibold bg-gray-200 px-2 py-0.5 rounded-md">
              {cart.items.length} plat(s)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                    <div className="text-xs text-gray-500">
                      {item.unit_price.toLocaleString()} F × {item.quantity}
                    </div>
                  </div>
                  <span className="font-bold text-sm text-gray-900">
                    {((item.unit_price + (item.modifiers_total || 0)) * item.quantity).toLocaleString()} FCFA
                  </span>
                </div>

                <Input
                  placeholder="Consigne cuisine..."
                  value={item.notes || ''}
                  onChange={(e) => cart.updateItemNote(idx, e.target.value)}
                  className="h-7 text-xs bg-white"
                />
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-gray-50 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total Session :</span>
              <span className="text-lg text-brand-700">{total.toLocaleString()} FCFA</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSaveUpdate}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-xl text-xs flex flex-col items-center justify-center gap-0.5"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (
                  <>
                    <Send size={16} />
                    <span>Mise à jour KDS 🍳</span>
                  </>
                )}
              </Button>

              <Button
                onClick={() => setSplitModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl text-xs flex flex-col items-center justify-center gap-0.5"
              >
                <CreditCard size={16} />
                <span>Régler / Split 💳</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {splitModalOpen && (
        <SplitBillModal
          isOpen={splitModalOpen}
          onClose={() => setSplitModalOpen(false)}
          sale={activeSale}
          onSuccess={() => {
            setSplitModalOpen(false);
            router.push('/restaurant/tables');
          }}
        />
      )}

      {modifierModalOpen && (
        <ModifierSelectorModal
          open={modifierModalOpen}
          onOpenChange={setModifierModalOpen}
          dish={selectedDishForModifiers}
          groups={dishModifierGroups}
          onConfirm={handleConfirmModifiers}
        />
      )}
    </div>
  );
}