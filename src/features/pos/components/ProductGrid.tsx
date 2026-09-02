import React, { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  ShoppingBag,
  Apple,
  Coffee,
  Sparkles,
  Milk,
  Cookie,
  Beef,
  Flame,
  X,
} from 'lucide-react';
import type { Product, Category } from '../../../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  currencySymbol: string;
  onSelectProduct: (product: Product) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  currencySymbol,
  onSelectProduct,
  searchInputRef,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'cat-grocery':
        return ShoppingBag;
      case 'cat-beverages':
        return Coffee;
      case 'cat-dairy':
        return Milk;
      case 'cat-snacks':
        return Cookie;
      case 'cat-produce':
        return Apple;
      case 'cat-meat':
        return Beef;
      case 'cat-household':
        return Sparkles;
      default:
        return LayoutGrid;
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.nameBn && p.nameBn.toLowerCase().includes(query)) ||
        p.barcode.includes(query) ||
        p.sku.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="flex h-full flex-col space-y-3 overflow-hidden">
      {/* 🔍 TOP SEARCH & BARCODE SCANNER BAR (Matching Reference 1 & 3) */}
      <div className="relative shrink-0">
        <div className="flex items-center h-12 w-full rounded-2xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 px-3.5 shadow-xs transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search items by name, barcode, SKU... (Press F2)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-full flex-1 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white mr-1.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
            <span>F2</span>
          </div>
        </div>
      </div>

      {/* 🏷️ CATEGORY PILLS HORIZONTAL BAR (Matching Reference 1 & 3) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
        {/* All Items Pill */}
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-current" />
          <span>All Items ({products.length})</span>
        </button>

        {/* Category Specific Pills */}
        {categories.map((c) => {
          const Icon = getCategoryIcon(c.id);
          const isSelected = selectedCategory === c.id;
          const count = products.filter((p) => p.categoryId === c.id).length;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-current" />
              <span>{c.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 📦 PRODUCT CARDS GRID */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300 dark:text-slate-600 stroke-1 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No products found
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Try searching with another keyword or barcode.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
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
