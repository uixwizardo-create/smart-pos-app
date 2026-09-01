import { db } from '../db/database';
import type { Product, Category, NewProductInput } from '../types';

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    return await db.products.toArray();
  }

  static async getActiveProducts(): Promise<Product[]> {
    return await db.products.filter(p => p.isActive).toArray();
  }

  static async getProductById(id: string): Promise<Product | undefined> {
    return await db.products.get(id);
  }

  static async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const trimmed = barcode.trim();
    return await db.products
      .filter(p => p.isActive && (p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase()))
      .first();
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
    return await db.categories.orderBy('order').toArray();
  }

  static async createCategory(category: Category): Promise<void> {
    await db.categories.add(category);
  }
}
