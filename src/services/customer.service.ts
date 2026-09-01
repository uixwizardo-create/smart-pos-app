import { db } from '../db/database';
import type { Customer, CustomerTransaction, NewCustomerInput } from '../types';

export class CustomerService {
  static async getAllCustomers(): Promise<Customer[]> {
    return await db.customers.orderBy('name').toArray();
  }

  static async getCustomerById(id: string): Promise<Customer | undefined> {
    return await db.customers.get(id);
  }

  static async createCustomer(input: NewCustomerInput): Promise<Customer> {
    const now = new Date().toISOString();
    const id = 'cust-' + Date.now();
    const initialDue = input.initialDue || 0;

    const newCustomer: Customer = {
      id,
      name: input.name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      totalSpent: 0,
      totalOrders: 0,
      currentDue: initialDue,
      creditLimit: input.creditLimit || 5000,
      loyaltyPoints: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.customers.add(newCustomer);

    if (initialDue > 0) {
      await db.customerTransactions.add({
        id: 'ctx-' + Date.now(),
        customerId: id,
        type: 'opening_balance',
        amount: initialDue,
        note: 'Opening due balance',
        createdAt: now,
      });
    }

    return newCustomer;
  }

  static async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
    await db.customers.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  static async recordDuePayment(
    customerId: string,
    amount: number,
    paymentMethod: 'cash' | 'bkash' | 'nagad' | 'card' | 'bank',
    note?: string
  ): Promise<void> {
    const customer = await db.customers.get(customerId);
    if (!customer) throw new Error('Customer not found');

    const newDue = Math.max(0, customer.currentDue - amount);
    await db.customers.update(customerId, {
      currentDue: newDue,
      updatedAt: new Date().toISOString(),
    });

    await db.customerTransactions.add({
      id: 'ctx-' + Date.now(),
      customerId,
      type: 'payment_received',
      amount,
      paymentMethod,
      note: note || 'Due payment settled',
      createdAt: new Date().toISOString(),
    });
  }

  static async getTransactionsByCustomerId(customerId: string): Promise<CustomerTransaction[]> {
    return await db.customerTransactions.where('customerId').equals(customerId).reverse().sortBy('createdAt');
  }
}
