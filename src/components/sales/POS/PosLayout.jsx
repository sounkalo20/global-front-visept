// app/shop/sales/new/pos-layout.jsx (REMPLACER)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, ShoppingCart, ChevronUp, ChevronDown, Maximize2, Minimize2, History, User, LogOut, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import ClientSelector from './ClientSelector';
import PaymentSection from './PaymentSection';
import PosClock from './PosClock';
import QuickHistoryModal from './QuickHistoryModal';
import useCartStore from '@/store/cartStore';
import useProductStore from '@/store/productStore';
import useSaleStore from '@/store/saleStore';
import useCompanyStore from '@/store/companyStore';
import useCashStore from '@/store/cashStore';
import useAuthStore from '@/store/authStore';
import useFullscreen from '@/hooks/useFullscreen';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ReceiptPreviewModal from '@/components/sales/receipt/ReceiptPreviewModal';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

export default function PosLayout({ mode = 'create', saleId = null, backLink }) {
  const router = useRouter();
  const { activeCompany } = useCompanyStore();
  const { posProducts, fetchPosProducts } = useProductStore();
  const { createSale, updateSale, fetchSaleById, currentSale } = useSaleStore();
  const { activeSession, fetchActiveSession } = useCashStore();
  const cart = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSale, setIsLoadingSale] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(true);
  const [completedSale, setCompletedSale] = useState(null);
  const [isProforma, setIsProforma] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { user, logout } = useAuthStore();
  
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [closingAmount, setClosingAmount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const isEditMode = mode === 'edit';
  const isCashier = activeCompany?.my_role === 'cashier';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    if (activeCompany) {
      fetchPosProducts(activeCompany.id);
      if (mode === 'create') {
        cart.clearCart();
        fetchActiveSession(activeCompany.id);
      }
    }
  }, [activeCompany, mode]);

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
      setIsProforma(false);
      setCompletedSale(result.sale);
    } else {
      toast.error(result.message);
    }
  };

  const handleProforma = () => {
    if (!activeCompany || cart.items.length === 0) {
      toast.error('Le panier est vide.');
      return;
    }
    const proformaSale = {
      sale_number: `PRF-${Date.now()}`,
      sale_date: new Date().toISOString(),
      client_name: cart.clientName,
      subtotal: cart.getSubtotal(),
      discount_amount: cart.getDiscountAmount(),
      total_amount: cart.getTotal(),
      amount_paid: cart.amountPaid || 0,
      payment_method: cart.paymentMethod,
      items: cart.items.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      }))
    };
    setIsProforma(true);
    setCompletedSale(proformaSale);
  };

  const handleReceiptClosed = () => {
      fetchPosProducts(activeCompany.id);
      if (mode === 'create') {
        cart.clearCart();
        fetchActiveSession(activeCompany.id);
      }
    setCompletedSale(null);
  };

  const handleCloseShift = async () => {
    setIsClosing(true);
    try {
      await api.post(`/cash/sessions/${activeSession.id}/close`, {
        company_id: activeCompany.id,
        actual_closing_amount: closingAmount !== '' ? Number(closingAmount) : Number(activeSession.expected_closing_amount),
        notes: closingNotes
      });
      toast.success("Caisse fermée avec succès");
      setShowCloseShiftModal(false);
      fetchActiveSession(activeCompany.id);
      
      // Rediriger le caissier vers la page d'ouverture de caisse
      if (isCashier) {
        router.replace('/shop/pos/shift');
      }
    } catch (error) {
      console.error("Erreur de fermeture de caisse", error);
      toast.error(error.response?.data?.message || "Erreur lors de la fermeture de la caisse");
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoadingSale || !activeCompany) {
    return <LoadingScreen variant="fullscreen" message="Chargement de la vente" />;
  }

  const itemsCount = cart.getItemsCount();
  const cartTotal = cart.getTotal();

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {!isCashier && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(isEditMode ? `${backLink}/${saleId}` : `${backLink}`)}
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg">
                  {isEditMode ? 'Modifier la vente' : 'Nouvelle vente'}
                </h1>
                {!isEditMode && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1",
                    activeSession ? "bg-green-100 text-green-700 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", activeSession ? "bg-green-500" : "bg-gray-400")} />
                    {activeSession ? `Caisse Ouverte : ${activeSession.register_name} - ${parseFloat(activeSession.expected_closing_amount || 0).toLocaleString()} FCFA` : 'Vente Libre'}
                  </span>
                )}
              </div>
              {isEditMode && currentSale && (
                <span className="text-xs text-gray-400">{currentSale.sale_number}</span>
              )}
            </div>
            <PosClock />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {activeSession && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  setClosingAmount(activeSession.expected_closing_amount);
                  setClosingNotes('');
                  setShowCloseShiftModal(true);
                }} 
                className="hidden md:flex gap-2"
              >
                <LogOut size={16} />
                Fermer la caisse
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="hidden md:flex gap-2 text-gray-600">
              <History size={16} />
              Historique
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400 hover:text-gray-700"
                  aria-label={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              </TooltipContent>
            </Tooltip>
            <ShoppingCart size={16} />
            <span>{itemsCount} article{itemsCount > 1 ? 's' : ''}</span>
            {itemsCount > 0 && (
              <Badge variant="outline" className="font-bold">
                {cartTotal.toLocaleString()} FCFA
              </Badge>
            )}
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200">
                  <User size={16} className="text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-brand-600 mt-0.5 capitalize">{activeCompany?.my_role === 'cashier' ? 'Caissier' : activeCompany?.my_role} - {activeCompany?.name}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User size={16} className="mr-2 text-gray-500" /> Mon profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut size={16} className="mr-2" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ProductGrid products={posProducts} onAddToCart={handleAddToCart} cartItems={cart.items} />
        </div>

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

      <div className="w-[380px] xl:w-[420px] border-l bg-white flex flex-col shrink-0 hidden lg:flex">
        <ClientSelector
          clientName={cart.clientName}
          onSetClient={cart.setClient}
        />

        <div className="flex-1 overflow-y-auto">
          <PaymentSection
            payments={cart.payments}
            onPaymentsChange={cart.setPayments}
            discountType={cart.discountType}
            onDiscountChange={cart.setDiscount}
            discountValue={cart.discountValue}
            onDiscountValueChange={(v) => cart.setDiscount(cart.discountType, v)}
            total={cartTotal}
          />
        </div>

        <div className="p-4 border-t bg-white flex gap-2">
          <Button
            onClick={handleProforma}
            variant="outline"
            className="flex-1 h-12 text-sm font-semibold rounded-xl"
            disabled={cart.items.length === 0}
          >
            Proforma
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 h-12 text-sm font-semibold rounded-xl"
            disabled={isSubmitting || cart.items.length === 0 || cart.amountPaid < cartTotal}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : cart.items.length === 0 ? (
              'Panier vide'
            ) : cart.amountPaid < cartTotal ? (
              `Manque ${(cartTotal - cart.amountPaid).toLocaleString()}`
            ) : (
              <>
                <Save size={18} className="mr-2 hidden xl:block" />
                Valider ({cartTotal.toLocaleString()})
              </>
            )}
          </Button>
        </div>
      </div>

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
      
      {completedSale && (
        <ReceiptPreviewModal 
          sale={completedSale} 
          open={!!completedSale} 
          isProforma={isProforma}
          onOpenChange={(open) => {
            if (!open) handleReceiptClosed();
          }} 
        />
      )}

      <QuickHistoryModal open={showHistory} onOpenChange={setShowHistory} />

      <Dialog open={showCloseShiftModal} onOpenChange={setShowCloseShiftModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Clôture de Caisse</DialogTitle>
            <DialogDescription>Rapport Z - Vérification des montants</DialogDescription>
          </DialogHeader>

          {activeSession && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-xl space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Caisse</span>
                  <span className="font-medium text-gray-900">{activeSession.register_name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Fond initial</span>
                  <span className="font-medium text-gray-900">{parseFloat(activeSession.opening_amount).toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Montant attendu (Espèces)</span>
                  <span className="font-bold text-gray-900 text-lg">{parseFloat(activeSession.expected_closing_amount).toLocaleString()} FCFA</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant réel compté (FCFA)</label>
                <input
                  type="number"
                  value={closingAmount}
                  onChange={(e) => setClosingAmount(e.target.value)}
                  className="w-full p-3 border rounded-xl font-bold text-xl"
                  placeholder="0"
                />
                
                {closingAmount !== '' && Number(closingAmount) !== Number(activeSession.expected_closing_amount) && (
                  <div className={`mt-2 text-sm p-3 rounded-lg flex items-start gap-2 ${Number(closingAmount) > Number(activeSession.expected_closing_amount) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">
                        Écart de {Math.abs(Number(closingAmount) - Number(activeSession.expected_closing_amount)).toLocaleString()} FCFA
                      </p>
                      <p className="opacity-90 text-xs">Une justification est requise pour cet écart.</p>
                    </div>
                  </div>
                )}
              </div>

              {(closingAmount === '' || Number(closingAmount) !== Number(activeSession.expected_closing_amount)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Justification (Obligatoire si écart)</label>
                  <textarea
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="w-full p-3 border rounded-xl text-sm min-h-[80px]"
                    placeholder="Expliquez la raison de l'écart..."
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseShiftModal(false)}>Annuler</Button>
            <Button 
              onClick={handleCloseShift} 
              variant="destructive"
              disabled={isClosing || (closingAmount !== '' && Number(closingAmount) !== Number(activeSession?.expected_closing_amount) && !closingNotes.trim())}
            >
              {isClosing ? 'Clôture...' : 'Confirmer la clôture'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}