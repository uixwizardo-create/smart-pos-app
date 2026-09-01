export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  totalOrders: number;
  currentDue: number;
  creditLimit: number;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  orderId?: string;
  type: 'sale_due' | 'payment_received' | 'opening_balance' | 'adjustment';
  amount: number;
  paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'card' | 'bank';
  note?: string;
  createdAt: string;
}

export type NewCustomerInput = Omit<Customer, 'id' | 'totalSpent' | 'totalOrders' | 'currentDue' | 'loyaltyPoints' | 'createdAt' | 'updatedAt'> & {
  initialDue?: number;
};
