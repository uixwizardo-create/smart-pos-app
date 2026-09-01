export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  iconName?: string;
  color?: string;
  order: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  nameBn?: string;
  categoryId: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStockAlert: number;
  unit: 'pcs' | 'kg' | 'gm' | 'ltr' | 'box' | 'packet';
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
