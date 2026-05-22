import { create } from "zustand";

const useCartStore = create((set, get) => ({
  items: [],
  clientId: null,
  clientName: null,
  discountType: "none",
  discountValue: 0,
  paymentMethod: "cash",
  paymentReference: "",
  amountPaid: 0,
  notes: "",

  // CHARGER UNE VENTE EXISTANTE DANS LE PANIER (pour modification)
  loadFromSale: (sale) => {
    const items = (sale.items || []).map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      unit_symbol: item.unit_symbol || "pcs",
      sku: item.product_sku,
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price),
      retail_price: parseFloat(item.retail_price_ref || item.unit_price),
      wholesale_price: parseFloat(item.wholesale_price_ref || 0),
      wholesale_min_qty: 1,
      price_type: item.price_type || "retail",
      discount_amount: parseFloat(item.discount_amount || 0),
      manage_stock: false, // sera ignoré en mode édition
      current_stock: 999999, // pas de vérification stock en édition
      _originalItem: true, // marqueur pour différencier
    }));

    set({
      items,
      clientId: sale.client_id || null,
      clientName: sale.client_name || null,
      discountType: sale.discount_type || "none",
      discountValue: parseFloat(sale.discount_value || 0),
      paymentMethod: sale.payment_method || "cash",
      paymentReference: sale.payment_reference || "",
      amountPaid: parseFloat(sale.amount_paid || 0),
      notes: sale.notes || "",
    });
  },

  // Ajouter un produit au panier
  addItem: (product, quantity = 1) => {
    const items = [...get().items];
    const existing = items.find((item) => item.product_id === product.id);

    if (existing) {
      if (
        product.manage_stock &&
        existing.quantity + quantity > product.current_stock
      )
        return;
      existing.quantity += quantity;
    } else {
      if (product.manage_stock && quantity > product.current_stock) return;
      items.push({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image_url,
        unit_symbol: product.unit_symbol || "pcs",
        sku: product.sku,
        quantity,
        unit_price: parseFloat(product.retail_price),
        retail_price: parseFloat(product.retail_price),
        wholesale_price: parseFloat(product.wholesale_price),
        wholesale_min_qty: product.wholesale_min_qty,
        price_type: "retail",
        discount_amount: 0,
        manage_stock: product.manage_stock,
        current_stock: product.current_stock,
      });
    }
    set({ items });
  },

  // Mettre à jour la quantité
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item,
      ),
    });
  },

  // Mettre à jour le prix unitaire
  updateUnitPrice: (productId, price, priceType = null) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              unit_price: Number(price),
              ...(priceType && { price_type: priceType }),
            }
          : item,
      ),
    }));
  },

  // Mettre à jour le type de prix
  updatePriceType: (productId, priceType) => {
    set({
      items: get().items.map((item) => {
        if (item.product_id !== productId) return item;
        const newPrice =
          priceType === "wholesale" ? item.wholesale_price : item.retail_price;
        return { ...item, price_type: priceType, unit_price: newPrice };
      }),
    });
  },

  // Supprimer un article
  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.product_id !== productId) });
  },

  // Vider le panier
  clearCart: () => {
    set({
      items: [],
      clientId: null,
      clientName: null,
      discountType: "none",
      discountValue: 0,
      paymentMethod: "cash",
      paymentReference: "",
      amountPaid: 0,
      notes: "",
    });
  },

  // Setters
  setClient: (clientId, clientName) => set({ clientId, clientName }),
  setDiscount: (type, value) =>
    set({ discountType: type, discountValue: value }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setPaymentReference: (ref) => set({ paymentReference: ref }),
  setAmountPaid: (amount) => set({ amountPaid: amount }),
  setNotes: (notes) => set({ notes }),

  // Calculs
  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0,
    );
  },

  getDiscountAmount: () => {
    const { discountType, discountValue } = get();
    const subtotal = get().getSubtotal();
    if (discountType === "percentage") return subtotal * (discountValue / 100);
    if (discountType === "fixed") return discountValue;
    return 0;
  },

  getTotal: () => {
    return get().getSubtotal() - get().getDiscountAmount();
  },

  getItemsCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Préparer le payload pour l'API
  getPayload: (companyId) => {
    const state = get();
    const total = state.getTotal();
    return {
      company_id: companyId,
      client_id: state.clientId,
      client_name: state.clientName,
      items: state.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        price_type: item.price_type,
        discount_amount: item.discount_amount,
      })),
      discount_type: state.discountType,
      discount_value:
        state.discountType !== "none" ? state.discountValue : null,
      payment_status: state.amountPaid >= total ? "paid" : "debt",
      amount_paid: state.amountPaid,
      payment_method: state.paymentMethod,
      payment_reference: state.paymentReference || null,
      notes: state.notes || null,
    };
  },

  // Préparer le payload pour l'API (modification)
  getUpdatePayload: (companyId) => {
    const state = get();
    const total = state.getTotal();
    return {
      company_id: companyId,
      client_id: state.clientId,
      client_name: state.clientName,
      items: state.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        price_type: item.price_type,
        discount_amount: item.discount_amount,
      })),
      discount_type: state.discountType,
      discount_value:
        state.discountType !== "none" ? state.discountValue : null,
      payment_status: state.amountPaid >= total ? "paid" : "debt",
      amount_paid: state.amountPaid,
      payment_method: state.paymentMethod,
      payment_reference: state.paymentReference || null,
      notes: state.notes || null,
    };
  },
}));

export default useCartStore;
