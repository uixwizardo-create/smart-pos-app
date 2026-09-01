import { useState, useEffect, useRef } from 'react';
import type { Product, Category, StoreSettings } from '../../types';
import { ProductService } from '../../services/product.service';
import { useCartStore } from '../../store/useCartStore';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

interface PosScreenProps {
  settings: StoreSettings;
}

export const PosScreen: React.FC<PosScreenProps> = ({ settings }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { addItem, setTaxConfig } = useCartStore();

  useEffect(() => {
    loadCatalog();
    setTaxConfig(settings.enableTax, settings.defaultTaxRate);
  }, [settings, setTaxConfig]);

  const loadCatalog = async () => {
    const [prods, cats] = await Promise.all([
      ProductService.getActiveProducts(),
      ProductService.getCategories(),
    ]);
    setProducts(prods);
    setCategories(cats);
  };

  // 1. Hardware Barcode Scanner listener
  useBarcodeScanner(true);

  // 2. Fast Keyboard Shortcuts
  useKeyboardShortcuts({
    onSearchFocus: () => searchInputRef.current?.focus(),
    onHelp: () => setIsHelpModalOpen(true),
  });

  return (
    <div className="flex h-[calc(100vh-64px)] gap-4 p-4 overflow-hidden">
      {/* Left Column: Product Catalog & Category Grid (65% width) */}
      <div className="flex-1 overflow-hidden">
        <ProductGrid
          products={products}
          categories={categories}
          currencySymbol={settings.currencySymbol}
          onSelectProduct={(p) => addItem(p, 1)}
          searchInputRef={searchInputRef}
        />
      </div>

      {/* Right Column: Billing Cart & Checkout Panel (35% width / min 380px) */}
      <div className="w-[380px] lg:w-[420px] shrink-0 h-full">
        <CartPanel settings={settings} />
      </div>

      {/* F1 Keyboard Shortcuts Help Guide */}
      <KeyboardShortcutsModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
