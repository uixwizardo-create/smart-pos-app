import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, ArrowRight, X } from 'lucide-react';
import type { Product, Category, StoreSettings } from '../../types';
import { ProductService } from '../../services/product.service';
import { useCartStore } from '../../store/useCartStore';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { formatCurrency } from '../../utils/formatters';

interface PosScreenProps {
  settings: StoreSettings;
}

export const PosScreen: React.FC<PosScreenProps> = ({ settings }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { addItem, setTaxConfig, getGrandTotal, getTotalItemsCount } = useCartStore();

  const grandTotal = getGrandTotal();
  const totalItems = getTotalItemsCount();

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
    <div className="relative flex h-[calc(100vh-60px)] md:h-[calc(100vh-64px)] gap-3 md:gap-4 p-2 sm:p-3 md:p-4 overflow-hidden">
      {/* Product Catalog & Category Grid (100% on Mobile, 65% on Desktop) */}
      <div className="flex-1 overflow-hidden h-full flex flex-col pb-16 lg:pb-0">
        <ProductGrid
          products={products}
          categories={categories}
          currencySymbol={settings.currencySymbol}
          onSelectProduct={(p) => addItem(p, 1)}
          searchInputRef={searchInputRef}
        />
      </div>

      {/* Desktop Cart & Checkout Panel (Visible only on lg / desktop >= 1024px) */}
      <div className="hidden lg:block w-[360px] xl:w-[420px] shrink-0 h-full">
        <CartPanel settings={settings} />
      </div>

      {/* 📱 MOBILE FLOATING CART BAR (Visible on screens < lg) */}
      {totalItems > 0 && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-30 animate-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 text-white shadow-2xl shadow-sky-950/40 border border-slate-800 cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white font-bold shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-semibold">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
                </div>
                <div className="text-lg font-black text-sky-400 font-mono leading-none mt-0.5">
                  {formatCurrency(grandTotal, settings.currencySymbol)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs">
              <span>View Cart & Pay</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* 📱 MOBILE SLIDE-UP CART BOTTOM SHEET / DRAWER */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          {/* Backdrop dismiss */}
          <div className="flex-1" onClick={() => setIsMobileCartOpen(false)} />

          {/* Cart Panel Sheet */}
          <div className="relative w-full max-h-[88vh] h-[88vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Close Button Header */}
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setIsMobileCartOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 h-full overflow-hidden">
              <CartPanel settings={settings} />
            </div>
          </div>
        </div>
      )}

      {/* F1 Keyboard Shortcuts Help Guide */}
      <KeyboardShortcutsModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
