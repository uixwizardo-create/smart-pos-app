import { create } from 'zustand';
import type { Product, Customer, OrderItem, HoldCart } from '../types';
import { soundManager } from '../utils/audio';
import { OrderService } from '../services/order.service';

interface CartState {
  items: OrderItem[];
  customer: Customer | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  taxRatePercent: number;
  enableTax: boolean;
  holdCarts: HoldCart[];

  // Actions
  setTaxConfig: (enable: boolean, rate: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setDiscount: (type: 'percentage' | 'fixed', value: number) => void;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  parkCurrentCart: (note?: string) => Promise<HoldCart | null>;
  recallParkedCart: (holdId: string) => Promise<void>;
  loadHoldCarts: () => Promise<void>;

  // Calculated Getters
  getSubtotal: () => number;
  getDiscountTotal: () => number;
  getTaxTotal: () => number;
  getGrandTotal: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  discountType: 'fixed',
  discountValue: 0,
  taxRatePercent: 5,
  enableTax: true,
  holdCarts: [],

  setTaxConfig: (enable, rate) => set({ enableTax: enable, taxRatePercent: rate }),
  setCustomer: (customer) => set({ customer }),
  setDiscount: (discountType, discountValue) => set({ discountType, discountValue: Math.max(0, discountValue) }),

  addItem: (product, quantity = 1) => {
    const { items, taxRatePercent, enableTax } = get();
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    const taxRate = enableTax ? taxRatePercent : 0;

    let updatedItems: OrderItem[];

    if (existingIndex > -1) {
      const existing = items[existingIndex];
      const newQty = existing.quantity + quantity;
      const subtotal = newQty * existing.unitPrice - existing.discount;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      updatedItems = [...items];
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal,
        taxAmount,
        total,
      };
    } else {
      const subtotal = quantity * product.salePrice;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const newItem: OrderItem = {
        productId: product.id,
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        nameBn: product.nameBn,
        imageUrl: product.imageUrl,
        unitPrice: product.salePrice,
        costPrice: product.costPrice,
        quantity,
        unit: product.unit,
        discount: 0,
        taxRatePercent: taxRate,
        taxAmount,
        subtotal,
        total,
      };
      updatedItems = [newItem, ...items];
    }

    soundManager.playScanBeep();
    set({ items: updatedItems });
  },

  updateQuantity: (productId, quantity) => {
    const { items, taxRatePercent, enableTax } = get();
    const taxRate = enableTax ? taxRatePercent : 0;

    if (quantity <= 0) {
      set({ items: items.filter((i) => i.productId !== productId) });
      return;
    }

    const updated = items.map((item) => {
      if (item.productId === productId) {
        const subtotal = quantity * item.unitPrice - item.discount;
        const taxAmount = (subtotal * taxRate) / 100;
        return {
          ...item,
          quantity,
          subtotal,
          taxAmount,
          total: subtotal + taxAmount,
        };
      }
      return item;
    });

    set({ items: updated });
  },

  updateItemDiscount: (productId, discount) => {
    const { items, taxRatePercent, enableTax } = get();
    const taxRate = enableTax ? taxRatePercent : 0;

    const updated = items.map((item) => {
      if (item.productId === productId) {
        const validDiscount = Math.min(item.unitPrice * item.quantity, Math.max(0, discount));
        const subtotal = item.quantity * item.unitPrice - validDiscount;
        const taxAmount = (subtotal * taxRate) / 100;
        return {
          ...item,
          discount: validDiscount,
          subtotal,
          taxAmount,
          total: subtotal + taxAmount,
        };
      }
      return item;
    });

    set({ items: updated });
  },

  removeItem: (productId) => {
    const { items } = get();
    set({ items: items.filter((i) => i.productId !== productId) });
  },

  clearCart: () => {
    set({
      items: [],
      customer: null,
      discountType: 'fixed',
      discountValue: 0,
    });
  },

  parkCurrentCart: async (note) => {
    const { items, discountType, discountValue, customer } = get();
    if (items.length === 0) return null;

    const held = await OrderService.holdCart({
      items,
      discountType,
      discountValue,
      customerId: customer?.id,
      customerName: customer?.name,
      note,
    });

    get().clearCart();
    await get().loadHoldCarts();
    return held;
  },

  recallParkedCart: async (holdId) => {
    const held = get().holdCarts.find((h) => h.id === holdId);
    if (!held) return;

    set({
      items: held.items,
      discountType: held.discountType,
      discountValue: held.discountValue,
    });

    await OrderService.deleteHoldCart(holdId);
    await get().loadHoldCarts();
  },

  loadHoldCarts: async () => {
    const carts = await OrderService.getHoldCarts();
    set({ holdCarts: carts });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  },

  getDiscountTotal: () => {
    const { items, discountType, discountValue } = get();
    const lineDiscounts = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const subtotal = get().getSubtotal();

    let cartDiscount = 0;
    if (discountType === 'percentage') {
      cartDiscount = (subtotal * discountValue) / 100;
    } else {
      cartDiscount = discountValue;
    }

    return lineDiscounts + Math.min(subtotal, cartDiscount);
  },

  getTaxTotal: () => {
    const { enableTax, taxRatePercent } = get();
    if (!enableTax) return 0;
    const taxableAmount = Math.max(0, get().getSubtotal() - get().getDiscountTotal());
    return (taxableAmount * taxRatePercent) / 100;
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountTotal();
    const tax = get().getTaxTotal();
    return Math.max(0, subtotal - discount + tax);
  },

  getTotalItemsCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
