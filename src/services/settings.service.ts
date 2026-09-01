import { db } from '../db/database';
import { DEFAULT_SETTINGS } from '../db/seedData';
import type { StoreSettings } from '../types';

export class SettingsService {
  static async getSettings(): Promise<StoreSettings> {
    const settings = await db.settings.get('default-settings');
    if (!settings) {
      await db.settings.put(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return settings;
  }

  static async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getSettings();
    const merged: StoreSettings = { ...current, ...updates };
    await db.settings.put(merged);
    return merged;
  }

  static async exportAllData(): Promise<string> {
    const products = await db.products.toArray();
    const categories = await db.categories.toArray();
    const customers = await db.customers.toArray();
    const customerTransactions = await db.customerTransactions.toArray();
    const orders = await db.orders.toArray();
    const shifts = await db.shifts.toArray();
    const cashMovements = await db.cashMovements.toArray();
    const settings = await db.settings.toArray();

    const dump = {
      version: 1,
      exportedAt: new Date().toISOString(),
      products,
      categories,
      customers,
      customerTransactions,
      orders,
      shifts,
      cashMovements,
      settings,
    };

    return JSON.stringify(dump, null, 2);
  }
}
