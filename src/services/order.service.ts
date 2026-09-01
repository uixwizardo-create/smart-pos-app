import { db } from '../db/database';
import type { Order, HoldCart } from '../types';
import { ProductService } from './product.service';

export class OrderService {
  static async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await db.orders.count();
    const seq = (count + 1).toString().padStart(4, '0');
    return `POS-${dateStr}-${seq}`;
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const now = new Date().toISOString();
    const orderNumber = await this.generateOrderNumber();
    const id = 'ord-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);

    const fullOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Save Order
    await db.orders.add(fullOrder);

    // 2. Decrement Stocks
    for (const item of fullOrder.items) {
      await ProductService.updateStock(item.productId, item.quantity);
    }

    // 3. Update Customer records if customer attached
    if (fullOrder.customerId && fullOrder.customerId !== 'cust-walkin') {
      const customer = await db.customers.get(fullOrder.customerId);
      if (customer) {
        const newTotalSpent = customer.totalSpent + fullOrder.grandTotal;
        const newTotalOrders = customer.totalOrders + 1;
        const newDue = customer.currentDue + (fullOrder.dueAmount || 0);
        const pointsEarned = Math.floor(fullOrder.grandTotal / 100);

        await db.customers.update(fullOrder.customerId, {
          totalSpent: newTotalSpent,
          totalOrders: newTotalOrders,
          currentDue: newDue,
          loyaltyPoints: customer.loyaltyPoints + pointsEarned,
          updatedAt: now,
        });

        if (fullOrder.dueAmount > 0) {
          await db.customerTransactions.add({
            id: 'ctx-' + Date.now(),
            customerId: fullOrder.customerId,
            orderId: fullOrder.id,
            type: 'sale_due',
            amount: fullOrder.dueAmount,
            note: `Due on Order #${fullOrder.orderNumber}`,
            createdAt: now,
          });
        }
      }
    }

    // 4. Update Current Open Shift sales
    const openShift = await db.shifts.filter(s => s.status === 'open').first();
    if (openShift) {
      const isCash = fullOrder.paymentMethod === 'cash';
      const isCard = fullOrder.paymentMethod === 'card';
      const isBkash = fullOrder.paymentMethod === 'bkash';
      const isNagad = fullOrder.paymentMethod === 'nagad';
      const isDue = fullOrder.paymentMethod === 'due';

      let cashAdd = 0;
      let cardAdd = 0;
      let bkashAdd = 0;
      let nagadAdd = 0;
      let dueAdd = 0;

      if (fullOrder.paymentMethod === 'split' && fullOrder.splitPayments) {
        for (const sp of fullOrder.splitPayments) {
          if (sp.method === 'cash') cashAdd += sp.amount;
          else if (sp.method === 'card') cardAdd += sp.amount;
          else if (sp.method === 'bkash') bkashAdd += sp.amount;
          else if (sp.method === 'nagad') nagadAdd += sp.amount;
          else if (sp.method === 'due') dueAdd += sp.amount;
        }
      } else {
        if (isCash) cashAdd = fullOrder.paidAmount - fullOrder.changeAmount;
        if (isCard) cardAdd = fullOrder.grandTotal;
        if (isBkash) bkashAdd = fullOrder.grandTotal;
        if (isNagad) nagadAdd = fullOrder.grandTotal;
        if (isDue) dueAdd = fullOrder.dueAmount;
      }

      await db.shifts.update(openShift.id, {
        totalOrders: openShift.totalOrders + 1,
        totalSales: openShift.totalSales + fullOrder.grandTotal,
        cashSales: openShift.cashSales + cashAdd,
        cardSales: openShift.cardSales + cardAdd,
        bkashSales: openShift.bkashSales + bkashAdd,
        nagadSales: openShift.nagadSales + nagadAdd,
        dueSales: openShift.dueSales + dueAdd,
        expectedCashInDrawer: openShift.expectedCashInDrawer + cashAdd,
      });
    }

    return fullOrder;
  }

  static async getAllOrders(): Promise<Order[]> {
    return await db.orders.reverse().sortBy('createdAt');
  }

  static async getTodayOrders(): Promise<Order[]> {
    const today = new Date().toISOString().slice(0, 10);
    return await db.orders
      .filter(o => o.createdAt.startsWith(today))
      .reverse()
      .sortBy('createdAt');
  }

  static async holdCart(holdData: Omit<HoldCart, 'id' | 'holdNumber' | 'createdAt'>): Promise<HoldCart> {
    const count = await db.holdCarts.count();
    const holdCart: HoldCart = {
      ...holdData,
      id: 'hold-' + Date.now(),
      holdNumber: `PARK-${(count + 1).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    await db.holdCarts.add(holdCart);
    return holdCart;
  }

  static async getHoldCarts(): Promise<HoldCart[]> {
    return await db.holdCarts.reverse().sortBy('createdAt');
  }

  static async deleteHoldCart(id: string): Promise<void> {
    await db.holdCarts.delete(id);
  }
}
