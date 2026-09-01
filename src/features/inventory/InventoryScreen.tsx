import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit2,
  Trash2,
  Barcode,
} from 'lucide-react';
import type { Product, Category, StoreSettings } from '../../types';
import { ProductService } from '../../services/product.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
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

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formNameBn, setFormNameBn] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formMinAlert, setFormMinAlert] = useState('5');
  const [formUnit, setFormUnit] = useState<Product['unit']>('pcs');
  const [formImageUrl, setFormImageUrl] = useState('');

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
    if (cats.length > 0 && !formCategory) {
      setFormCategory(cats[1]?.id || cats[0]?.id);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormNameBn('');
    setFormSku(`SKU-${Date.now().toString().slice(-6)}`);
    setFormBarcode(`894${Math.floor(10000000 + Math.random() * 90000000)}`);
    setFormCost('');
    setFormPrice('');
    setFormStock('10');
    setFormMinAlert('5');
    setFormUnit('pcs');
    setFormImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormNameBn(p.nameBn || '');
    setFormCategory(p.categoryId);
    setFormSku(p.sku);
    setFormBarcode(p.barcode);
    setFormCost(p.costPrice.toString());
    setFormPrice(p.salePrice.toString());
    setFormStock(p.stock.toString());
    setFormMinAlert(p.minStockAlert.toString());
    setFormUnit(p.unit);
    setFormImageUrl(p.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    try {
      if (editingProduct) {
        await ProductService.updateProduct(editingProduct.id, {
          name: formName.trim(),
          nameBn: formNameBn.trim() || undefined,
          categoryId: formCategory,
          sku: formSku.trim(),
          barcode: formBarcode.trim(),
          costPrice: parseFloat(formCost) || 0,
          salePrice: parseFloat(formPrice) || 0,
          stock: parseInt(formStock, 10) || 0,
          minStockAlert: parseInt(formMinAlert, 10) || 5,
          unit: formUnit,
          imageUrl: formImageUrl.trim() || undefined,
        });
        showToast('Product Updated', `${formName} was updated successfully.`, 'success');
      } else {
        await ProductService.createProduct({
          name: formName.trim(),
          nameBn: formNameBn.trim() || undefined,
          categoryId: formCategory,
          sku: formSku.trim(),
          barcode: formBarcode.trim(),
          costPrice: parseFloat(formCost) || 0,
          salePrice: parseFloat(formPrice) || 0,
          stock: parseInt(formStock, 10) || 0,
          minStockAlert: parseInt(formMinAlert, 10) || 5,
          unit: formUnit,
          imageUrl: formImageUrl.trim() || undefined,
          isActive: true,
        });
        showToast('Product Created', `${formName} added to inventory.`, 'success');
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
      await loadData();
      showToast('Product Deleted', `${name} removed from inventory.`, 'info');
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
    <div className="flex h-[calc(100vh-70px)] flex-col p-6 space-y-4 overflow-y-auto">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-7 h-7 text-sky-600" />
            Inventory & Stock Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage product catalog, barcode numbers, pricing, and stock alerts
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={handleOpenAddModal}>
          <Plus className="w-5 h-5 mr-1.5" />
          Add New Product
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`flex items-center gap-1.5 h-10 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
            filterLowStock
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock Warning ({lowStockCount})</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3.5">Product Name</th>
                <th className="px-4 py-3.5">Barcode / SKU</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-right">Cost Price</th>
                <th className="px-4 py-3.5 text-right">Sale Price</th>
                <th className="px-4 py-3.5 text-center">Stock</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  const isLow = p.stock <= p.minStockAlert;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-9 w-9 rounded-lg object-cover bg-slate-100"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {p.name}
                            </div>
                            {p.nameBn && (
                              <div className="text-xs text-slate-400">{p.nameBn}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                        <div>{p.barcode}</div>
                        <div className="text-[10px] text-slate-400">{p.sku}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                          {cat ? cat.name : p.categoryId}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                        {formatCurrency(p.costPrice, settings.currencySymbol)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.salePrice, settings.currencySymbol)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLow ? (
                          <Badge variant="warning">
                            {p.stock} {p.unit}
                          </Badge>
                        ) : (
                          <Badge variant="success">
                            {p.stock} {p.unit}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Product Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Inventory Product'}
        description="Enter product barcode, pricing, category, and initial stock units"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Product English Name *"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Coca Cola 500ml"
            />
            <Input
              label="Product Bangla Name"
              value={formNameBn}
              onChange={(e) => setFormNameBn(e.target.value)}
              placeholder="যেমন: কোকা কোলা ৫০০ মি.লি."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Unit Type *
              </label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value as Product['unit'])}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="packet">Packet</option>
                <option value="box">Box</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="gm">Gram (gm)</option>
                <option value="ltr">Liter (ltr)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Barcode / EAN *"
              required
              value={formBarcode}
              onChange={(e) => setFormBarcode(e.target.value)}
              icon={<Barcode className="w-4 h-4" />}
            />
            <Input
              label="SKU Code *"
              required
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`Cost / Buying Price (${settings.currencySymbol})`}
              type="number"
              value={formCost}
              onChange={(e) => setFormCost(e.target.value)}
              placeholder="0.00"
            />
            <Input
              label={`Sale / MRP Price (${settings.currencySymbol}) *`}
              type="number"
              required
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Available Stock Units *"
              type="number"
              required
              value={formStock}
              onChange={(e) => setFormStock(e.target.value)}
            />
            <Input
              label="Low Stock Warning Threshold"
              type="number"
              value={formMinAlert}
              onChange={(e) => setFormMinAlert(e.target.value)}
            />
          </div>

          <Input
            label="Product Image URL (Unsplash or direct image link)"
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
