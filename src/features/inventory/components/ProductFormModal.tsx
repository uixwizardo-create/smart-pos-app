import React, { useState, useEffect } from 'react';
import { Barcode, ChevronDown } from 'lucide-react';
import type { Product, Category } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  categories: Category[];
  currencySymbol: string;
  onSave: (productData: {
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
  }) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  categories,
  currencySymbol,
  onSave,
}) => {
  const [formName, setFormName] = useState('');
  const [formNameBn, setFormNameBn] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formMinAlert, setFormMinAlert] = useState('5');
  const [formUnit, setFormUnit] = useState<Product['unit']>('pcs');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormName(editingProduct.name);
      setFormNameBn(editingProduct.nameBn || '');
      setFormCategory(editingProduct.categoryId);
      setFormSku(editingProduct.sku);
      setFormBarcode(editingProduct.barcode);
      setFormCost(editingProduct.costPrice.toString());
      setFormPrice(editingProduct.salePrice.toString());
      setFormStock(editingProduct.stock.toString());
      setFormMinAlert(editingProduct.minStockAlert.toString());
      setFormUnit(editingProduct.unit);
      setFormImageUrl(editingProduct.imageUrl || '');
    } else {
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
      if (categories.length > 0) {
        setFormCategory(categories[0].id);
      }
    }
  }, [editingProduct, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    try {
      setIsSubmitting(true);
      await onSave({
        name: formName.trim(),
        nameBn: formNameBn.trim() || undefined,
        categoryId: formCategory || categories[0]?.id || 'cat-general',
        sku: formSku.trim(),
        barcode: formBarcode.trim(),
        costPrice: parseFloat(formCost) || 0,
        salePrice: parseFloat(formPrice) || 0,
        stock: parseInt(formStock, 10) || 0,
        minStockAlert: parseInt(formMinAlert, 10) || 5,
        unit: formUnit,
        imageUrl: formImageUrl.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Product Details' : 'Add New Inventory Product'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Product English Name *"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Weather Care 18L"
          />
          <Input
            label="Product Bangla Name"
            value={formNameBn}
            onChange={(e) => setFormNameBn(e.target.value)}
            placeholder="যেমন: ওয়েদার কেয়ার ১৮ লিটার"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Category *
            </label>
            <div className="relative">
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="h-10 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-3.5 pr-9 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Unit Type *
            </label>
            <div className="relative">
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value as Product['unit'])}
                className="h-10 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-3.5 pr-9 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white cursor-pointer"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="packet">Packet</option>
                <option value="box">Box</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="gm">Gram (gm)</option>
                <option value="ltr">Liter (ltr)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Barcode *"
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

        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label={`Cost Price (${currencySymbol})`}
            type="number"
            value={formCost}
            onChange={(e) => setFormCost(e.target.value)}
          />
          <Input
            label={`Sale Price (${currencySymbol}) *`}
            type="number"
            required
            value={formPrice}
            onChange={(e) => setFormPrice(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <Input
            label="Stock Units *"
            type="number"
            required
            value={formStock}
            onChange={(e) => setFormStock(e.target.value)}
          />
          <Input
            label="Low Stock Alert"
            type="number"
            value={formMinAlert}
            onChange={(e) => setFormMinAlert(e.target.value)}
          />
        </div>

        <Input
          label="Image URL"
          value={formImageUrl}
          onChange={(e) => setFormImageUrl(e.target.value)}
          placeholder="https://... or /rainbow/..."
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {editingProduct ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
