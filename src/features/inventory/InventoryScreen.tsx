import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import type { Product, Category, StoreSettings } from '../../types';
import { ProductService } from '../../services/product.service';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProductFormModal } from './components/ProductFormModal';
import { formatCurrency } from '../../utils/formatters';
import { useToastStore } from '../../store/useToastStore';

interface InventoryScreenProps {
  settings: StoreSettings;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ settings }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Add/Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prods, cats] = await Promise.all([
      ProductService.getAllProducts(),
      ProductService.getCategories(),
    ]);
    setProducts(prods);
    setCategories(cats.filter((c) => c.id !== 'cat-all'));
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData: {
    name: string;
    nameBn?: string;
    categoryId: string;
    sku: string;
    barcode: string;
    costPrice: number;
    salePrice: number;
    stock: number;
    minStockAlert: number;
    unit: Product['unit'];
    imageUrl?: string;
  }) => {
    try {
      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, productData);
        showToast('Product Updated', `${productData.name} updated successfully.`, 'success');
      } else {
        await ProductService.createProduct({
          ...productData,
          isActive: true,
        });
        showToast('Product Created', `${productData.name} added to inventory.`, 'success');
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      showToast('Error', (err as Error).message, 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await ProductService.deleteProduct(id);
      showToast('Product Deleted', `Removed "${name}" from stock`, 'info');
      await loadData();
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = !filterLowStock || p.stock <= p.minStockAlert;
    return matchesCategory && matchesSearch && matchesLowStock;
  });

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 space-y-4 overflow-y-auto">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            Inventory & Stock
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage product catalog, barcode numbers, and stock levels
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-2xl border border-slate-200/80 bg-slate-50 pl-10 pr-3 text-xs sm:text-sm font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Dropdown with Chevron */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 appearance-none rounded-2xl border border-slate-200/80 bg-slate-50 pl-3.5 pr-9 text-xs font-bold text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>

        <button
          type="button"
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`flex items-center gap-1.5 h-10 px-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            filterLowStock
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Low Stock ({lowStockCount})</span>
          <span className="sm:hidden">Alerts ({lowStockCount})</span>
        </button>
      </div>

      {/* Inventory Table Container */}
      <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-xs text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/90 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5 hidden sm:table-cell">Barcode/SKU</th>
                <th className="px-4 py-3.5 hidden md:table-cell">Category</th>
                <th className="px-4 py-3.5 text-right hidden sm:table-cell">Cost</th>
                <th className="px-4 py-3.5 text-right">Price</th>
                <th className="px-4 py-3.5 text-center">Stock</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  const isOutOfStock = p.stock <= 0;
                  const isLow = p.stock <= p.minStockAlert;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-10 w-10 rounded-xl object-contain bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
                              <Package className="w-5 h-5 stroke-1" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate text-xs sm:text-sm">
                              {p.name}
                            </div>
                            {p.nameBn && (
                              <div className="text-[11px] text-slate-400 truncate">
                                {p.nameBn}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 hidden sm:table-cell">
                        <div>{p.barcode}</div>
                        <div className="text-[10px] text-slate-400">{p.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-xs hidden md:table-cell">
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-slate-600 dark:text-slate-300 font-medium">
                          {cat?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-slate-500 hidden sm:table-cell">
                        {formatCurrency(p.costPrice, settings.currencySymbol)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                        {formatCurrency(p.salePrice, settings.currencySymbol)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isOutOfStock ? (
                          <Badge variant="danger" size="sm">
                            0 {p.unit}
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="warning" size="sm">
                            {p.stock} {p.unit}
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            {p.stock} {p.unit}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal Component */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProduct={editingProduct}
        categories={categories}
        currencySymbol={settings.currencySymbol}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
