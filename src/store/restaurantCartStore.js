import { create } from 'zustand';

const useRestaurantCartStore = create((set, get) => ({
  orderType: 'dine_in', // 'dine_in', 'counter', 'takeaway', 'delivery'
  tableId: null,
  tableSessionId: null,
  tableName: null,
  numberOfGuests: 1,
  staffId: null,
  staffName: null,
  clientId: null,
  clientName: null,
  items: [],
  payments: [],
  discountType: 'none', // 'none', 'percentage', 'fixed'
  discountValue: 0,
  notes: '',

  setOrderType: (type) => set({ orderType: type }),

  setTableSession: ({ tableId, tableSessionId, tableName, numberOfGuests, staffId, staffName }) => set({
    tableId: tableId || null,
    tableSessionId: tableSessionId || null,
    tableName: tableName || null,
    numberOfGuests: numberOfGuests || 1,
    staffId: staffId || null,
    staffName: staffName || null,
  }),

  setClient: (clientId, clientName) => set({ clientId, clientName }),
  setItems: (items) => set({ items }),

  addItem: (product, quantity = 1, notes = '') => {
    const { items } = get();
    const existingIndex = items.findIndex(i => i.product_id === product.id && !i.modifiers?.length);

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      set({ items: updated });
    } else {
      const newItem = {
        product_id: product.id,
        name: product.name,
        image_url: product.image_url,
        unit_price: Number(product.retail_price || product.price || 0),
        quantity: Number(quantity),
        price_type: 'retail',
        discount_amount: 0,
        modifiers_total: 0,
        modifiers: [],
        notes: notes,
        item_status: 'pending',
      };
      set({ items: [...items, newItem] });
    }
  },

  addItemWithModifiers: (product, quantity, unitPrice, extraPrice, modifierChoices, notes = '') => {
    const { items } = get();
    const newItem = {
      product_id: product.id,
      name: product.name,
      image_url: product.image_url,
      unit_price: Number(unitPrice),
      quantity: Number(quantity),
      price_type: 'retail',
      discount_amount: 0,
      modifiers_total: Number(extraPrice || 0),
      modifiers: modifierChoices || [],
      notes: notes,
      item_status: 'pending',
    };
    set({ items: [...items, newItem] });
  },

  updateQuantity: (productId, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      set({ items: items.filter(i => i.product_id !== productId) });
    } else {
      set({
        items: items.map(i => i.product_id === productId ? { ...i, quantity: Number(quantity) } : i)
      });
    }
  },

  updateItemNote: (index, notes) => {
    const { items } = get();
    const updated = [...items];
    if (updated[index]) {
      updated[index].notes = notes;
      set({ items: updated });
    }
  },

  removeItem: (index) => {
    const { items } = get();
    set({ items: items.filter((_, i) => i !== index) });
  },

  setDiscount: (type, value) => set({ discountType: type, discountValue: Number(value || 0) }),

  addPayment: (payment) => {
    const { payments } = get();
    set({ payments: [...payments, payment] });
  },

  removePayment: (index) => {
    const { payments } = get();
    set({ payments: payments.filter((_, i) => i !== index) });
  },

  clearPayments: () => set({ payments: [] }),

  clearCart: () => set({
    orderType: 'dine_in',
    tableId: null,
    tableSessionId: null,
    tableName: null,
    numberOfGuests: 1,
    staffId: null,
    staffName: null,
    clientId: null,
    clientName: null,
    items: [],
    payments: [],
    discountType: 'none',
    discountValue: 0,
    notes: '',
  }),

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      const itemPrice = (Number(item.unit_price) + Number(item.modifiers_total || 0)) * Number(item.quantity);
      return sum + itemPrice;
    }, 0);
  },

  getDiscountAmount: () => {
    const { discountType, discountValue } = get();
    const subtotal = get().getSubtotal();
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed') {
      return Math.min(subtotal, discountValue);
    }
    return 0;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    return Math.max(0, subtotal - discount);
  },

  getTotalPaid: () => {
    const { payments } = get();
    return (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  },

  getAmountDue: () => {
    const total = get().getTotal();
    const paid = get().getTotalPaid();
    return Math.max(0, total - paid);
  },
}));

export default useRestaurantCartStore;
