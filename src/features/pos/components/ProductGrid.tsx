import React, { useState, useMemo } from 'react';
import { Search, Sparkles, ShoppingBag, Coffee, Cookie, Milk, Apple, LayoutGrid, X, Barcode } from 'lucide-react';
import type { Product, Category } from '../../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  currencySymbol?: string;
  onSelectProduct: (product: Product) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  currencySymbol = '৳',
  onSelectProduct,
  searchInputRef,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('cat-all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Coffee':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'Cookie':
        return <Cookie className="w-3.5 h-3.5" />;
      case 'Milk':
        return <Milk className="w-3.5 h-3.5" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Apple':
        return <Apple className="w-3.5 h-3.5" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5" />;
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'cat-all' || product.categoryId === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        (product.nameBn && product.nameBn.toLowerCase().includes(q)) ||
        product.barcode.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="flex h-full flex-col gap-3.5 overflow-hidden">
      {/* 🌟 ZONE 1: HERO ACTION SEARCH & BARCODE SCAN BAR */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-sky-600 dark:text-sky-400">
          <Barcode className="w-5 h-5" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="⚡ Scan Barcode or Type Product / SKU (Hot-key: F2)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-13 w-full rounded-2xl border-2 border-slate-200/90 bg-white pl-12 pr-20 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/15 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-sky-400 shadow-sm transition-all"
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
              F2
            </kbd>
          )}
        </div>
      </div>

      {/* Category Pills Slider - Tactile & Subdued */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none shrink-0">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'cat-all'
              ? products.length
              : products.filter((p) => p.categoryId === cat.id).length;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                isSelected
                  ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900 font-extrabold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ZONE 2: PRODUCT CATALOG GRID */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/30">
            <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No matching products found
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Check spelling or clear search filter to see catalog items.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 pb-2">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currencySymbol={currencySymbol}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
