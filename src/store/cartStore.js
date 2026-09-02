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
  payments: [{ method: "cash", amount: 0, reference: "" }],
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
      payments: sale.payments && sale.payments.length > 0
        ? sale.payments.map(p => ({ method: p.payment_method, amount: parseFloat(p.amount), reference: p.reference || "" }))
        : [{ method: sale.payment_method || "cash", amount: parseFloat(sale.amount_paid || 0), reference: sale.payment_reference || "" }],
      notes: sale.notes || "",
    });
  },

  // Ajouter un produit au panier
  addItem: (product, quantity = 1) => {
    const items = [...get().items];
    const existing = items.find((item) => item.product_id === product.id && !item.modifier_choices);

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
        cart_item_id: `${product.id}-${Date.now()}-${Math.random()}`,
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

  // Ajouter un plat avec modificateurs
  addItemWithModifiers: (product, quantity, unitPrice, extraPrice, modifierChoices) => {
    const items = [...get().items];
    items.push({
      cart_item_id: `${product.id}-${Date.now()}-${Math.random()}`,
      product_id: product.id,
      product_name: product.name,
      product_image: product.image_url,
      unit_symbol: product.unit_symbol || "pcs",
      sku: product.sku,
      quantity,
      unit_price: parseFloat(unitPrice),
      extra_price: parseFloat(extraPrice || 0),
      modifier_choices: modifierChoices,
      retail_price: parseFloat(product.retail_price),
      wholesale_price: parseFloat(product.wholesale_price),
      price_type: "retail",
      discount_amount: 0,
      manage_stock: false,
    });
    set({ items });
  },

  // Mettre à jour la quantité
  updateQuantity: (cartItemIdOrProductId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemIdOrProductId);
      return;
    }
    set({
      items: get().items.map((item) =>
        (item.cart_item_id === cartItemIdOrProductId || item.product_id === cartItemIdOrProductId)
          ? { ...item, quantity }
          : item,
      ),
    });
  },

  // Mettre à jour le prix unitaire
  updateUnitPrice: (cartItemIdOrProductId, price, priceType = null) => {
    set((state) => ({
      items: state.items.map((item) =>
        (item.cart_item_id === cartItemIdOrProductId || item.product_id === cartItemIdOrProductId)
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
  updatePriceType: (cartItemIdOrProductId, priceType) => {
    set({
      items: get().items.map((item) => {
        if (item.cart_item_id !== cartItemIdOrProductId && item.product_id !== cartItemIdOrProductId) return item;
        const newPrice =
          priceType === "wholesale" ? item.wholesale_price : item.retail_price;
        return { ...item, price_type: priceType, unit_price: newPrice };
      }),
    });
  },

  // Supprimer un article
  removeItem: (cartItemIdOrProductId) => {
    set({
      items: get().items.filter(
        (item) => item.cart_item_id !== cartItemIdOrProductId && item.product_id !== cartItemIdOrProductId
      ),
    });
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
      payments: [],
      notes: "",
    });
  },

  // Setters
  setClient: (clientId, clientName) => set({ clientId, clientName }),
  setDiscount: (type, value) =>
    set({ discountType: type, discountValue: value }),
  setPayment: (method, amount, reference = "") =>
    set({ paymentMethod: method, amountPaid: amount, paymentReference: reference }),
  setPayments: (payments) => {
    const totalPaid = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
    set({ payments, amountPaid: totalPaid, paymentMethod: payments.length > 0 ? payments[0].method : 'cash' });
  },
  setPaymentReference: (ref) => set({ paymentReference: ref }),
  setAmountPaid: (amount) => set({ amountPaid: amount }),
  setNotes: (notes) => set({ notes }),

  // Calculs
  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + (item.unit_price + (item.extra_price || 0)) * item.quantity,
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

  tableId: null,
  tableSessionId: null,

  setTable: (tableId, tableSessionId = null) => set({ tableId, tableSessionId }),

  // Préparer le payload pour l'API
  getPayload: (companyId) => {
    const state = get();
    const total = state.getTotal();
    return {
      company_id: companyId,
      table_id: state.tableId || null,
      table_session_id: state.tableSessionId || null,
      client_id: state.clientId,
      client_name: state.clientName,
      items: state.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        price_type: item.price_type,
        discount_amount: item.discount_amount,
        modifier_choices: item.modifier_choices || [],
      })),
      discount_type: state.discountType,
      discount_value:
        state.discountType !== "none" ? state.discountValue : null,
      payment_status: state.amountPaid >= total ? "paid" : "debt",
      amount_paid: state.amountPaid,
      payment_method: state.paymentMethod,
      payment_reference: state.paymentReference || null,
      payments: state.payments,
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
        modifier_choices: item.modifier_choices || [],
      })),
      discount_type: state.discountType,
      discount_value:
        state.discountType !== "none" ? state.discountValue : null,
      payment_status: state.amountPaid >= total ? "paid" : "debt",
      amount_paid: state.amountPaid,
      payment_method: state.paymentMethod,
      payment_reference: state.paymentReference || null,
      payments: state.payments,
      notes: state.notes || null,
    };
  },

}));

export default useCartStore;
