export type PaymentMethod = 'cash' | 'card' | 'bkash' | 'nagad' | 'due' | 'split';

export type OrderStatus = 'completed' | 'refunded' | 'cancelled';

export interface PaymentSplit {
  method: Exclude<PaymentMethod, 'split'>;
  amount: number;
  transactionRef?: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  barcode: string;
  name: string;
  nameBn?: string;
  imageUrl?: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  unit: string;
  discount: number; // Flat discount per line or total line discount
  taxRatePercent: number;
  taxAmount: number;
  subtotal: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. POS-20260901-0001
  shiftId?: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  itemsCount: number;
  subtotal: number;
  discountTotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  couponCode?: string;
  taxTotal: number;
  taxRatePercent: number;
  grandTotal: number;
  roundedTotal: number;
  paidAmount: number;
  changeAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  splitPayments?: PaymentSplit[];
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HoldCart {
  id: string;
  holdNumber: string;
  note?: string;
  customerName?: string;
  customerId?: string;
  items: OrderItem[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  createdAt: string;
}
