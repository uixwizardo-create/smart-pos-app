import Dexie, { type Table } from 'dexie';
import type {
  Product,
  Category,
  Customer,
  CustomerTransaction,
  Order,
  HoldCart,
  CashShift,
  CashMovement,
  StoreSettings,
} from '../types';

export class PosDatabase extends Dexie {
  products!: Table<Product, string>;
  categories!: Table<Category, string>;
  customers!: Table<Customer, string>;
  customerTransactions!: Table<CustomerTransaction, string>;
  orders!: Table<Order, string>;
  holdCarts!: Table<HoldCart, string>;
  shifts!: Table<CashShift, string>;
  cashMovements!: Table<CashMovement, string>;
  settings!: Table<StoreSettings, string>;

  constructor() {
    super('SmartPosDB');

    this.version(1).stores({
      products: 'id, sku, barcode, name, categoryId, salePrice, stock, isActive, createdAt',
      categories: 'id, name, order',
      customers: 'id, name, phone, currentDue, createdAt',
      customerTransactions: 'id, customerId, orderId, type, createdAt',
      orders: 'id, orderNumber, shiftId, customerId, status, paymentMethod, createdAt',
      holdCarts: 'id, holdNumber, createdAt',
      shifts: 'id, status, openedAt, closedAt',
      cashMovements: 'id, shiftId, type, createdAt',
      settings: 'id',
    });
  }
}

export const db = new PosDatabase();
