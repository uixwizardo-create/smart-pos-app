import { db } from '../db/database';
import type { Product, Category, NewProductInput } from '../types';

const CANONICAL_SEED_IMAGES: Record<string, string> = {
  'prod-001': '/images/products/coca-cola.jpg',
  'prod-002': '/images/products/sprite.jpg',
  'prod-003': '/images/products/red-bull.jpg',
  'prod-004': '/images/products/miniket-rice.jpg',
  'prod-005': '/images/products/soybean-oil.jpg',
  'prod-006': '/images/products/sugar.jpg',
  'prod-007': '/images/products/milk-bread.jpg',
  'prod-008': '/images/products/oreo.jpg',
  'prod-009': '/images/products/liquid-milk.jpg',
  'prod-010': '/images/products/brown-eggs.jpg',
  'prod-011': '/images/products/dove-soap.jpg',
  'prod-012': '/images/products/red-apple.jpg',
  'prod-013': '/images/products/banana.jpg',
  'prod-014': '/images/products/nescafe-coffee.jpg',
  'prod-015': '/images/products/maggi-noodles.jpg',
};

function normalizeProduct(p: Product): Product {
  const canonical = CANONICAL_SEED_IMAGES[p.id];
  if (canonical && p.imageUrl !== canonical) {
    // Sync IndexedDB in background
    db.products.update(p.id, { imageUrl: canonical }).catch(() => {});
    return { ...p, imageUrl: canonical };
  }
  return p;
}

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    const list = await db.products.toArray();
    return list.map(normalizeProduct);
  }

  static async getActiveProducts(): Promise<Product[]> {
    const list = await db.products.filter(p => p.isActive).toArray();
    return list.map(normalizeProduct);
  }

  static async getProductById(id: string): Promise<Product | undefined> {
    const p = await db.products.get(id);
    return p ? normalizeProduct(p) : undefined;
  }

  static async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const trimmed = barcode.trim();
    const p = await db.products
      .filter(prod => prod.isActive && (prod.barcode === trimmed || prod.sku.toLowerCase() === trimmed.toLowerCase()))
      .first();
    return p ? normalizeProduct(p) : undefined;
  }

  static async createProduct(input: NewProductInput): Promise<Product> {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...input,
      id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: now,
      updatedAt: now,
    };
    await db.products.add(newProduct);
    return newProduct;
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await db.products.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deleteProduct(id: string): Promise<void> {
    await db.products.delete(id);
  }

  static async updateStock(productId: string, quantityDeduction: number): Promise<void> {
    const product = await db.products.get(productId);
    if (product) {
      const newStock = Math.max(0, product.stock - quantityDeduction);
      await db.products.update(productId, { stock: newStock, updatedAt: new Date().toISOString() });
    }
  }

  static async getCategories(): Promise<Category[]> {
    const list = await db.categories.orderBy('order').toArray();
    return list.filter((c) => c.id !== 'cat-all' && c.name.toLowerCase() !== 'all products');
  }

  static async createCategory(category: Category): Promise<void> {
    await db.categories.add(category);
  }
}
