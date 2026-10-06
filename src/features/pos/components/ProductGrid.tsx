import React, { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  Paintbrush,
  Sun,
  ShieldCheck,
  Sparkles,
  Trees,
  Car,
  Anchor,
  Droplets,
  Palette,
  Layers,
  Flame,
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  Eye,
  EyeOff,
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

const SIZE_FILTERS = [
  { id: 'all', label: 'All Sizes' },
  { id: '18L', label: '18L Drum' },
  { id: '3.64L', label: '3.64L Gallon' },
  { id: '0.91L', label: '0.91L Can' },
  { id: '25kg', label: '25Kg Putty' },
  { id: 'colorant', label: '1000ml Colorant' },
];

const BASE_FILTERS = [
  { id: 'all', label: 'All Bases' },
  { id: 'rb-1', label: 'RB-1' },
  { id: 'rb-2', label: 'RB-2' },
  { id: 'rb-3', label: 'RB-3' },
  { id: 'rb-n', label: 'RB-N' },
];

const SORT_OPTIONS = [
  { id: 'default', label: 'Default Order' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
  { id: 'margin-desc', label: 'Highest Margin (Discount %)' },
];

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  currencySymbol,
  onSelectProduct,
  searchInputRef,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedBase, setSelectedBase] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [showCost, setShowCost] = useState(false);
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = React.useCallback(() => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScroll, categories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'cat-interior':
        return Paintbrush;
      case 'cat-exterior':
        return Sun;
      case 'cat-primers':
        return ShieldCheck;
      case 'cat-enamel':
        return Sparkles;
      case 'cat-wood':
        return Trees;
      case 'cat-auto':
        return Car;
      case 'cat-marine':
        return Anchor;
      case 'cat-waterproofing':
        return Droplets;
      case 'cat-colorant':
        return Palette;
      case 'cat-specialty':
        return Layers;
      default:
        return LayoutGrid;
    }
  };

  const filteredProducts = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();

    // Helper: normalize alphanumeric strings (handles "rb1", "rb-1", "rb 1", "0.91l", etc.)
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanQuery = normalize(rawQuery);

    const matchesSize = (p: Product, size: string) => {
      if (size === 'all') return true;
      const text = (p.name + ' ' + (p.nameBn || '')).toLowerCase();
      if (size === '18L') return text.includes('18 l') || text.includes('18.2') || text.includes('drum');
      if (size === '3.64L') return text.includes('3.6') || text.includes('gallon');
      if (size === '0.91L') return text.includes('0.9') || text.includes('0.455') || text.includes('1 ltr') || text.includes('quarter');
      if (size === '25kg') return text.includes('kg') || text.includes('putty') || text.includes('cement');
      if (size === 'colorant') return text.includes('1000 ml') || text.includes('colorant');
      return true;
    };

    const matchesBase = (p: Product, base: string) => {
      if (base === 'all') return true;
      const clean = normalize(p.name + ' ' + (p.nameBn || ''));
      if (base === 'rb-1') return clean.includes('rb1');
      if (base === 'rb-2') return clean.includes('rb2');
      if (base === 'rb-3') return clean.includes('rb3');
      if (base === 'rb-n') return clean.includes('rbn');
      return true;
    };

    const result = products.filter((p) => {
      // 1. Category Filter (searches across all if query typed, otherwise matches selected category)
      const matchesCat = !rawQuery ? (selectedCategory === 'all' || p.categoryId === selectedCategory) : true;
      if (!matchesCat) return false;

      // 2. Pack Size Filter
      if (!matchesSize(p, selectedSize)) return false;

      // 3. Tinting Base Filter
      if (!matchesBase(p, selectedBase)) return false;

      // 4. Search Query Match
      if (rawQuery) {
        const rawMatch =
          p.name.toLowerCase().includes(rawQuery) ||
          (p.nameBn && p.nameBn.toLowerCase().includes(rawQuery)) ||
          p.barcode.toLowerCase().includes(rawQuery) ||
          p.sku.toLowerCase().includes(rawQuery);

        if (rawMatch) return true;

        if (cleanQuery) {
          const cleanName = normalize(p.name);
          const cleanSubtitle = normalize(p.nameBn || '');
          const cleanBarcode = normalize(p.barcode);
          const cleanSku = normalize(p.sku);

          return (
            cleanName.includes(cleanQuery) ||
            cleanSubtitle.includes(cleanQuery) ||
            cleanBarcode.includes(cleanQuery) ||
            cleanSku.includes(cleanQuery)
          );
        }
        return false;
      }

      return true;
    });

    // 5. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.salePrice - b.salePrice);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.salePrice - a.salePrice);
    } else if (sortBy === 'margin-desc') {
      result.sort((a, b) => {
        const marginA = a.costPrice > 0 ? (a.salePrice - a.costPrice) / a.salePrice : 0;
        const marginB = b.costPrice > 0 ? (b.salePrice - b.costPrice) / b.salePrice : 0;
        return marginB - marginA;
      });
    }

    return result;
  }, [products, selectedCategory, searchQuery, selectedSize, selectedBase, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedSize !== 'all' ||
    selectedBase !== 'all' ||
    sortBy !== 'default';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedBase('all');
    setSortBy('default');
  };

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
      <div className="relative flex items-center shrink-0">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-1 z-10 flex items-center pr-4 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 pointer-events-none">
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 transition-all cursor-pointer"
              title="Previous categories"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Category Container */}
        <div
          ref={categoryScrollRef}
          onScroll={checkScroll}
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar scroll-smooth w-full px-0.5"
        >
          {/* All Items Pill */}
          <button
            type="button"
            onClick={(e) => {
              setSelectedCategory('all');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
            }}
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
          {categories
            .filter((c) => c.id !== 'cat-all' && c.name.toLowerCase() !== 'all products')
            .map((c) => {
            const Icon = getCategoryIcon(c.id);
            const isSelected = selectedCategory === c.id;
            const count = products.filter((p) => p.categoryId === c.id).length;

            return (
              <button
                key={c.id}
                type="button"
                onClick={(e) => {
                  setSelectedCategory(c.id);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
                }}
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

        {/* Right Arrow Button */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-1 z-10 flex items-center pl-4 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 pointer-events-none">
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 transition-all cursor-pointer"
              title="More categories"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 🎯 SECONDARY SMART PAINT FILTERS (Pack Size, Tinting Base & Sorting) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 py-0.5 shrink-0">
        {/* Left: Pack Size & Base Pill Groups */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Pack Size Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            {SIZE_FILTERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSize(s.id)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                  selectedSize === s.id
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

          {/* Tinting Machine Base Pills */}
          <div className="flex items-center bg-amber-500/10 dark:bg-amber-500/15 p-0.5 rounded-xl border border-amber-500/30 shrink-0">
            <span className="px-2 text-[10px] font-black tracking-wider text-amber-700 dark:text-amber-400 uppercase">
              Base:
            </span>
            {BASE_FILTERS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBase(b.id)}
                className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                  selectedBase === b.id
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-amber-800/90 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Sort & Filter Reset Status */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Active Result Count */}
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
            <strong className="text-slate-700 dark:text-slate-300 font-bold">{filteredProducts.length}</strong> items
          </span>

          {/* Merchant Cost Visibility Toggle (DP / Margin) */}
          <button
            type="button"
            onClick={() => setShowCost(!showCost)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border shadow-2xs ${
              showCost
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800'
                : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border-slate-200/90 dark:border-slate-800'
            }`}
            title={showCost ? 'Hide Wholesale Dealer Price (DP)' : 'Show Wholesale Dealer Price (DP)'}
          >
            {showCost ? <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400" /> : <EyeOff className="w-3 h-3" />}
            <span>DP</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-2.5 py-1 shadow-2xs">
            <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 text-[11px] font-bold transition-all cursor-pointer border border-rose-200/70 dark:border-rose-900/60 shadow-2xs"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 📦 PRODUCT CARDS GRID */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
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
                showCost={showCost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
