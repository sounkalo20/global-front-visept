// app/shop/sales/new/pos-layout.jsx (REMPLACER)
'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, ShoppingCart, ChevronUp, ChevronDown, Maximize2, Minimize2, History, User, LogOut, AlertCircle, RotateCcw } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import ClientSelector from './ClientSelector';
import PaymentSection from './PaymentSection';
import PosClock from './PosClock';
import QuickHistoryModal from './QuickHistoryModal';
import PosReturnModal from './PosReturnModal';
import NetworkStatusBadge from './NetworkStatusBadge';
import OfflineSyncModal from './OfflineSyncModal';
import ThemeToggle from '@/components/layout/ThemeToggle';
import useCartStore from '@/store/cartStore';
import useProductStore from '@/store/productStore';
import useSaleStore from '@/store/saleStore';
import useCompanyStore from '@/store/companyStore';
import useCashStore from '@/store/cashStore';
import useAuthStore from '@/store/authStore';
import usePermissionsStore from '@/store/permissionsStore';
import useOfflineStore from '@/store/offlineStore';
import syncManager from '@/lib/sync/offlineSyncManager';
import {
  saveCatalogue,
  getCatalogue,
  saveActiveSession,
  enqueueOfflineSale,
  updateLocalStock,
  getOrCreateDeviceId,
} from '@/lib/db/posDatabase';
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
  const [showReturn, setShowReturn] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [isMobilePaymentOpen, setIsMobilePaymentOpen] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { user, logout } = useAuthStore();
  const { isOnline, isServerReachable, pendingCount } = useOfflineStore();
  
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [closingAmount, setClosingAmount] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const { roleName, isSystemRole } = usePermissionsStore();
  const isCashier = activeCompany?.my_role === 'cashier' || (isSystemRole && roleName === 'Caissier');

  const isEditMode = mode === 'edit';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    if (activeCompany) {
      // Démarrer le SyncManager
      syncManager.start(activeCompany.id);

      fetchPosProducts(activeCompany.id).then(() => {
        const prods = useProductStore.getState().posProducts;
        if (prods && prods.length > 0) {
          saveCatalogue(activeCompany.id, prods);
        }
      }).catch(async () => {
        // Fallback IndexedDB si hors-ligne
        const localProds = await getCatalogue(activeCompany.id);
        if (localProds && localProds.length > 0) {
          useProductStore.setState({ posProducts: localProds });
        }
      });

      if (mode === 'create') {
        cart.clearCart();
        fetchActiveSession(activeCompany.id).then(() => {
          const sess = useCashStore.getState().activeSession;
          if (sess) saveActiveSession(activeCompany.id, sess);
        });
      }
    }

    return () => {
      syncManager.stop();
    };
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

    // Détection si hors-ligne
    const isNetworkDown = !navigator.onLine || !isServerReachable;

    if (isNetworkDown && !isEditMode) {
      // Traitement hors-ligne
      try {
        const offlineUuid = crypto.randomUUID ? crypto.randomUUID() : ('off_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randSeq = Math.floor(1000 + Math.random() * 9000);
        const tempNumber = `OFF-${dateStr}-${randSeq}`;
        const deviceId = getOrCreateDeviceId();

        await enqueueOfflineSale(activeCompany.id, {
          offline_uuid: offlineUuid,
          temp_number: tempNumber,
          device_id: deviceId,
          payload,
          created_at: new Date().toISOString(),
        });

        await updateLocalStock(activeCompany.id, cart.items);

        const provisionalSale = {
          id: offlineUuid,
          sale_number: tempNumber,
          sale_date: new Date().toISOString(),
          client_name: cart.clientName || 'Client passager',
          items: cart.items.map(i => ({
            ...i,
            product_name: i.product_name,
            unit_price: i.unit_price,
            quantity: i.quantity,
            total_price: i.unit_price * i.quantity,
          })),
          subtotal: cart.getSubtotal(),
          discount_amount: cart.getDiscountAmount(),
          total_amount: cart.getTotal(),
          amount_paid: cart.amountPaid || cart.getTotal(),
          payment_method: cart.paymentMethod,
          payments: cart.payments,
          is_provisional: true,
        };

        setIsSubmitting(false);
        setIsProforma(false);
        setCompletedSale(provisionalSale);
        setIsMobilePaymentOpen(false);
        cart.clearCart();

        toast.success(`Vente enregistrée en mode hors-ligne (${tempNumber}) !`);
        syncManager.checkHealthAndSync();
        return;
      } catch (err) {
        console.error("Erreur enregistrement offline:", err);
        setIsSubmitting(false);
        toast.error("Erreur lors de l'enregistrement hors-ligne.");
        return;
      }
    }

    try {
      const result = isEditMode ? await updateSale(saleId, payload) : await createSale(payload);
      setIsSubmitting(false);

      if (result.success) {
        toast.success(isEditMode ? 'Vente modifiée !' : 'Vente validée !');
        setIsProforma(false);
        setCompletedSale(result.sale);
        setIsMobilePaymentOpen(false);
      } else {
        // Si l'erreur est de type réseau lors de l'envoi, bascule automatique offline
        if (!isEditMode && (!navigator.onLine || result.message?.includes('Network') || result.message?.includes('connexion'))) {
          toast.warning("Connexion interrompue. Enregistrement local en cours...");
          setIsSubmitting(false);
          // Relance en mode hors-ligne
          const offlineUuid = crypto.randomUUID ? crypto.randomUUID() : ('off_' + Date.now());
          const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const tempNumber = `OFF-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
          const deviceId = getOrCreateDeviceId();

          await enqueueOfflineSale(activeCompany.id, {
            offline_uuid: offlineUuid,
            temp_number: tempNumber,
            device_id: deviceId,
            payload,
            created_at: new Date().toISOString(),
          });

          await updateLocalStock(activeCompany.id, cart.items);

          const provisionalSale = {
            id: offlineUuid,
            sale_number: tempNumber,
            sale_date: new Date().toISOString(),
            client_name: cart.clientName || 'Client passager',
            items: cart.items.map(i => ({ ...i, product_name: i.product_name })),
            subtotal: cart.getSubtotal(),
            discount_amount: cart.getDiscountAmount(),
            total_amount: cart.getTotal(),
            amount_paid: cart.amountPaid || cart.getTotal(),
            payment_method: cart.paymentMethod,
            payments: cart.payments,
            is_provisional: true,
          };

          setCompletedSale(provisionalSale);
          setIsMobilePaymentOpen(false);
          cart.clearCart();
          toast.success(`Vente enregistrée en mode hors-ligne (${tempNumber}) !`);
          syncManager.checkHealthAndSync();
        } else {
          toast.error(result.message);
        }
      }
    } catch (e) {
      setIsSubmitting(false);
      toast.error("Erreur lors de la validation.");
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
    setIsMobilePaymentOpen(false);
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
    <div className="h-screen flex bg-gray-50 dark:bg-[#0B0F14] text-gray-900 dark:text-[#F9FAFB]">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-[#374151] px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            {!isCashier && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(isEditMode ? `${backLink}/${saleId}` : `${backLink}`)}
                className="hover:bg-gray-100 dark:hover:bg-[#1F2937] text-gray-700 dark:text-[#D1D5DB]"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-gray-900 dark:text-[#F9FAFB]">
                  {isEditMode ? 'Modifier la vente' : 'Nouvelle vente'}
                </h1>
                {!isEditMode && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1",
                    activeSession ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" : "bg-gray-100 dark:bg-[#1F2937] text-gray-600 dark:text-[#D1D5DB] border border-gray-200 dark:border-[#374151]"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full inline-block", activeSession ? "bg-green-500" : "bg-gray-400 dark:bg-[#9CA3AF]")} />
                    {activeSession ? `Caisse Ouverte : ${activeSession.register_name} - ${parseFloat(activeSession.expected_closing_amount || 0).toLocaleString()} FCFA` : 'Vente Libre'}
                  </span>
                )}
              </div>
              {isEditMode && currentSale && (
                <span className="text-xs text-gray-400 dark:text-[#9CA3AF]">{currentSale.sale_number}</span>
              )}
            </div>
            <PosClock />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-[#D1D5DB]">
            <ThemeToggle />
            {/* Indicateur de Connexion & Synchro CO-07 */}
            <NetworkStatusBadge onClick={() => setSyncModalOpen(true)} />

            {activeSession && !isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setClosingAmount(activeSession.expected_closing_amount);
                  setClosingNotes('');
                  setShowCloseShiftModal(true);
                }}
                className="hidden md:flex gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={16} />
                Fermer la caisse
              </Button>
            )}
            {activeSession && !isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReturn(true)}
                className="hidden md:flex gap-2 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/30"
              >
                <RotateCcw size={16} />
                Retour
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowHistory(true)} className="hidden md:flex gap-2 text-gray-600 dark:text-[#D1D5DB] border-gray-200 dark:border-[#374151] hover:bg-gray-100 dark:hover:bg-[#1F2937]">
              <History size={16} />
              Historique
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F2937] flex items-center justify-center transition-colors text-gray-400 dark:text-[#9CA3AF] hover:text-gray-700 dark:hover:text-[#F9FAFB]"
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
              <Badge variant="outline" className="font-bold border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300">
                {cartTotal.toLocaleString()} FCFA
              </Badge>
            )}
            <div className="w-px h-6 bg-gray-200 dark:bg-[#374151] mx-1"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1F2937] hover:bg-gray-200 dark:hover:bg-[#374151]">
                  <User size={16} className="text-gray-700 dark:text-[#D1D5DB]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#1F2937] border-gray-200 dark:border-[#374151] shadow-2xl">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-[#F9FAFB]">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5 capitalize">{isCashier ? 'Caissier' : activeCompany?.my_role} - {activeCompany?.name}</p>
                </div>
                
                {/* Actions sur mobile uniquement */}
                <div className="md:hidden">
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#374151]" />
                  <DropdownMenuItem onClick={() => setShowHistory(true)} className="dark:hover:bg-[#374151]">
                    <History size={16} className="mr-2 text-gray-500 dark:text-[#9CA3AF]" /> Historique
                  </DropdownMenuItem>
                  {activeSession && !isEditMode && (
                    <DropdownMenuItem onClick={() => setShowReturn(true)} className="text-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/30">
                      <RotateCcw size={16} className="mr-2" /> Retour produit
                    </DropdownMenuItem>
                  )}
                  {activeSession && (
                    <DropdownMenuItem 
                      onClick={() => {
                        setClosingAmount(activeSession.expected_closing_amount);
                        setClosingNotes('');
                        setShowCloseShiftModal(true);
                      }}
                      className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={16} className="mr-2" /> Fermer la caisse
                    </DropdownMenuItem>
                  )}
                </div>

                <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#374151]" />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="dark:hover:bg-[#374151]">
                  <User size={16} className="mr-2 text-gray-500 dark:text-[#9CA3AF]" /> Mon profil
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-[#374151]" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 dark:hover:bg-red-950/30">
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
          <div className="border-t border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] shadow-lg shrink-0">
            <button
              onClick={() => setCartExpanded(!cartExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-[#1F2937] hover:bg-gray-100 dark:hover:bg-[#374151] transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-[#D1D5DB] flex items-center gap-2">
                <ShoppingCart size={16} />
                Panier ({itemsCount})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-brand-700 dark:text-brand-400">{cartTotal.toLocaleString()} FCFA</span>
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

      <div className="w-[380px] xl:w-[420px] border-l border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] flex flex-col shrink-0 hidden lg:flex">
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

        <div className="p-4 border-t border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] flex gap-2">
          <Button
            onClick={handleProforma}
            variant="outline"
            className="flex-1 h-12 text-sm font-semibold rounded-xl border-gray-200 dark:border-[#374151] dark:text-[#D1D5DB] dark:hover:bg-[#1F2937]"
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#111827] border-t border-gray-200 dark:border-[#374151] z-40">
        <Sheet open={isMobilePaymentOpen} onOpenChange={setIsMobilePaymentOpen}>
          <SheetTrigger asChild>
            <Button
              className="w-full h-12 text-base font-semibold rounded-xl"
              disabled={cart.items.length === 0}
            >
              {cart.items.length === 0 ? (
                'Panier vide'
              ) : (
                <>
                  Paiement & Client • {cartTotal.toLocaleString()} FCFA
                </>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[95vh] p-0 flex flex-col bg-gray-50 dark:bg-[#0B0F14] border-t border-gray-200 dark:border-[#374151] z-[90]" showCloseButton={true}>
            <SheetHeader className="sr-only">
              <SheetTitle>Finalisation du panier et règlement</SheetTitle>
              <SheetDescription>Sélectionnez le client et les modes de règlement</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-[#374151] bg-white dark:bg-[#111827] mb-4">
                <div className="flex justify-between items-center font-medium mb-2">
                  <span className="text-gray-900 dark:text-[#F9FAFB] font-semibold">Résumé du panier ({itemsCount} articles)</span>
                  <span className="text-brand-700 dark:text-brand-400 font-bold">{cartTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-[#D1D5DB] max-h-24 overflow-y-auto space-y-1">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <span className="flex-1 truncate pr-2">{item.quantity}x {item.product_name}</span>
                      <span className="font-medium shrink-0">{(item.quantity * item.unit_price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ClientSelector
                clientName={cart.clientName}
                onSetClient={cart.setClient}
              />
              <div className="mt-4 mb-4">
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
            </div>
            
            <div className="mt-auto shrink-0 p-4 bg-white border-t flex gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
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
                  ) : cart.amountPaid < cartTotal ? (
                    `Manque ${(cartTotal - cart.amountPaid).toLocaleString()}`
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Valider
                    </>
                  )}
                </Button>
            </div>
          </SheetContent>
        </Sheet>
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

      {/* ─── Modal Retour Produit ─── */}
      <PosReturnModal
        open={showReturn}
        onOpenChange={setShowReturn}
      />

      {/* ─── Modal Synchronisation Hors-Ligne ─── */}
      <OfflineSyncModal
        open={syncModalOpen}
        onOpenChange={setSyncModalOpen}
        companyId={activeCompany?.id}
      />
    </div>
  );
}