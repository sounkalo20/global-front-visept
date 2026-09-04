'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft, Save, ShoppingCart, ChevronDown, ChevronUp, Utensils, Send, Receipt, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ProductGrid from '@/components/sales/POS/ProductGrid';
import ClientSelector from '@/components/sales/POS/ClientSelector';
import ModifierSelectorModal from '@/components/restaurant/pos/ModifierSelectorModal';
import OrderModeHeader from '@/components/restaurant/pos/OrderModeHeader';
import OrderModeSelector from '@/components/restaurant/pos/OrderModeSelector';
import TableSelectorModal from '@/components/restaurant/pos/TableSelectorModal';
import SplitBillModal from '@/components/restaurant/pos/SplitBillModal';
import OrderSessionTabs from '@/components/restaurant/pos/OrderSessionTabs';
import useRestaurantCartStore from '@/store/restaurantCartStore';
import useRestaurantDishStore from '@/store/restaurantDishStore';
import useRestaurantSaleStore from '@/store/restaurantSaleStore';
import useRestaurantModifierStore from '@/store/restaurantModifierStore';
import useCompanyStore from '@/store/companyStore';
import { cn } from '@/lib/utils';

export default function RestaurantPosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTableId = searchParams.get('table_id');
  const initialSessionId = searchParams.get('session_id');

  const { activeCompany } = useCompanyStore();
  const { dishes, fetchDishes } = useRestaurantDishStore();
  const { createSale, processSplitPayment } = useRestaurantSaleStore();
  const { getDishModifiers } = useRestaurantModifierStore();
  const cart = useRestaurantCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(true);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [splitModalOpen, setSplitModalOpen] = useState(false);

  // Modificateurs state
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [selectedDishForModifiers, setSelectedDishForModifiers] = useState(null);
  const [dishModifierGroups, setDishModifierGroups] = useState([]);

  useEffect(() => {
    if (activeCompany) fetchDishes();
    cart.clearCart();

    if (initialTableId || initialSessionId) {
      cart.setTableSession({
        tableId: initialTableId,
        tableSessionId: initialSessionId,
      });
    }
  }, [activeCompany, initialTableId, initialSessionId]);

  const handleAddToCart = useCallback(async (product) => {
    const res = await getDishModifiers(product.id);
    if (res.success && res.groups && res.groups.length > 0) {
      setSelectedDishForModifiers(product);
      setDishModifierGroups(res.groups);
      setModifierModalOpen(true);
    } else {
      cart.addItem(product);
      toast.success(`${product.name} ajouté !`);
    }
  }, [getDishModifiers, cart]);

  const handleConfirmModifiers = ({ product, quantity, unitPrice, extraPrice, modifierChoices }) => {
    cart.addItemWithModifiers(product, quantity, unitPrice, extraPrice, modifierChoices);
    toast.success(`${product.name} personnalisé ajouté !`);
  };

  // Envoi des commandes en cuisine (KDS)
  const handleSendToKitchen = async () => {
    if (cart.items.length === 0) {
      toast.error('Le panier est vide.');
      return;
    }

    if (cart.orderType === 'dine_in' && !cart.tableId) {
      toast.error('Veuillez d abord sélectionner une table.');
      setTableModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      company_id: activeCompany.id,
      order_type: cart.orderType,
      table_id: cart.tableId,
      table_session_id: cart.tableSessionId,
      client_id: cart.clientId,
      client_name: cart.clientName,
      items: cart.items,
      discount_type: cart.discountType,
      discount_value: cart.discountValue,
      notes: cart.notes,
      payment_status: 'unpaid',
      amount_paid: 0,
      is_kitchen_order: true,
      status: 'pending',
    };

    const result = await createSale(payload);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Commande transmise en cuisine (KDS) avec succès !');
      cart.clearCart();
    } else {
      toast.error(result.message || 'Erreur lors de l envoi.');
    }
  };

  const subtotal = cart.getSubtotal();
  const total = cart.getTotal();
  const itemsCount = cart.items.length;

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-gray-50">
      {/* Header Contextuel Restaurant */}
      <OrderModeHeader onOpenTableSelector={() => setTableModalOpen(true)} />

      {/* Barre de Gestion Multi-Sessions & Tables Actives */}
      <OrderSessionTabs onOpenTableSelector={() => setTableModalOpen(true)} />

      <div className="flex-1 flex min-h-0">
        {/* Colonne gauche : Mode Selector + Grille Plats */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <OrderModeSelector
              value={cart.orderType}
              onChange={(mode) => cart.setOrderType(mode)}
            />
            <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <ShoppingCart size={16} />
              <span>{itemsCount} plat{itemsCount > 1 ? 's' : ''}</span>
              <Badge variant="outline" className="font-bold text-brand-700">
                {total.toLocaleString()} FCFA
              </Badge>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ProductGrid products={dishes} onAddToCart={handleAddToCart} cartItems={cart.items} />
          </div>
        </div>

        {/* Colonne droite : Panier & Actions Restaurant */}
        <div className="w-[380px] xl:w-[420px] border-l bg-white flex flex-col shrink-0">
          <div className="p-3 border-b bg-gray-50">
            <ClientSelector clientName={cart.clientName} onSetClient={cart.setClient} />
          </div>

          {/* Liste des Plats dans le Panier */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Utensils className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm font-medium">Panier vide</p>
                <p className="text-xs mt-1">Sélectionnez des plats à gauche pour composer la commande.</p>
              </div>
            ) : (
              cart.items.map((item, idx) => (
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

                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.modifiers.map((m, mIdx) => (
                        <span key={mIdx} className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-medium">
                          {m.option_name}
                        </span>
                      ))}
                    </div>
                  )}

                  <Input
                    placeholder="Consigne cuisine (ex: sans sel, bien cuit)..."
                    value={item.notes || ''}
                    onChange={(e) => cart.updateItemNote(idx, e.target.value)}
                    className="h-7 text-xs bg-white"
                  />
                </div>
              ))
            )}
          </div>

          {/* Actions & Boutons Envoi KDS / Encaisser */}
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total Commande :</span>
              <span className="text-lg text-brand-700">{total.toLocaleString()} FCFA</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSendToKitchen}
                disabled={isSubmitting || cart.items.length === 0}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-xl text-xs flex flex-col items-center justify-center gap-0.5"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    <span>Envoyer KDS 🍳</span>
                  </>
                )}
              </Button>

              <Button
                onClick={() => setSplitModalOpen(true)}
                disabled={cart.items.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl text-xs flex flex-col items-center justify-center gap-0.5"
              >
                <CreditCard size={16} />
                <span>Encaisser 💳</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales Restaurant */}
      {tableModalOpen && (
        <TableSelectorModal
          isOpen={tableModalOpen}
          onClose={() => setTableModalOpen(false)}
          onSelectTable={(table, session) => {
            cart.setTableSession({
              tableId: table.id,
              tableSessionId: session?.id,
              tableName: table.table_number || table.table_name,
              numberOfGuests: session?.number_of_guests || 1,
            });
            setTableModalOpen(false);
          }}
        />
      )}

      {splitModalOpen && (
        <SplitBillModal
          isOpen={splitModalOpen}
          onClose={() => setSplitModalOpen(false)}
          sale={{
            id: cart.tableSessionId,
            total_amount: total,
            amount_paid: 0,
            amount_due: total,
            items: cart.items,
          }}
          onSuccess={() => {
            setSplitModalOpen(false);
            cart.clearCart();
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
