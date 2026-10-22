import type { StoreSettings } from '../types';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './catalogData';

export { SEED_CATEGORIES, SEED_PRODUCTS };

export const DEFAULT_SETTINGS: StoreSettings = {
  id: 'default-store-settings',
  storeName: 'Rainbow Paints & Color Studio',
  storeNameBn: 'রেইনবো পেইন্টস অ্যান্ড কালার স্টুডিও',
  branchName: 'Main Showroom',
  tagline: 'Authorized Dealer & Premium Tinting Station',
  address: 'Paint Merchant Row, GEC Circle, Chattogram',
  phone: '+880 1819-000000',
  email: 'rainbowpaints.ctg@gmail.com',
  vatRegistrationNumber: 'BIN-002948123-0101',
  currencySymbol: '৳',
  currencyCode: 'BDT',
  defaultTaxRate: 5,
  enableTax: true,
  paperSize: '80mm',
  receiptHeaderNote: 'Welcome to Rainbow Paints',
  receiptFooterNote: 'Thank you for choosing Rainbow Paints! Tinted custom colors are non-refundable.',
  enableSound: true,
  autoPrintReceipt: false,
  defaultReceiptPriceMode: 'mrp',
  cashierName: 'Admin',
};

export async function initializeDatabase(): Promise<void> {
  const { db } = await import('./database');

  try {
    const existingProducts = await db.products.toArray();
    // Re-sync if products still use old ltr units or lack official rainbow images
    const isOldCatalog =
      existingProducts.length !== SEED_PRODUCTS.length ||
      existingProducts.some((p) => p.unit === 'ltr' || !p.imageUrl?.includes('/rainbow/'));

    if (isOldCatalog) {
      console.log('Syncing database with Rainbow Paints official PNG images and pcs units...');
      await db.products.clear();
      await db.categories.clear();

      await db.categories.bulkPut(SEED_CATEGORIES);
      await db.products.bulkPut(SEED_PRODUCTS);

      const existingSettings = await db.settings.get(DEFAULT_SETTINGS.id);
      if (!existingSettings) {
        await db.settings.put(DEFAULT_SETTINGS);
      }
      console.log('Database synced with verified Rainbow Paints catalog.');
      return;
    }

    const categoriesCount = await db.categories.count();
    if (categoriesCount === 0) {
      await db.categories.bulkPut(SEED_CATEGORIES);
    }

    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.put(DEFAULT_SETTINGS);
    }
  } catch (error) {
    console.error('Failed to initialize or migrate database:', error);
  }
}
