import React from 'react';
import { Plus, Package } from 'lucide-react';
import type { Product } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onSelect: (product: Product) => void;
}

interface CategoryStudioStyle {
  bg: string;
  badge: string;
  badgeLabel: string;
}

const CATEGORY_STUDIO_MAP: Record<string, CategoryStudioStyle> = {
  'cat-interior': {
    bg: 'from-emerald-50 via-teal-50/40 to-emerald-100/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-900/30',
    badge: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
    badgeLabel: 'Interior',
  },
  'cat-exterior': {
    bg: 'from-amber-50 via-orange-50/40 to-amber-100/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-900/30',
    badge: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
    badgeLabel: 'Exterior',
  },
  'cat-primers': {
    bg: 'from-sky-50 via-blue-50/40 to-sky-100/60 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-sky-900/30',
    badge: 'bg-sky-100/90 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60',
    badgeLabel: 'Primer',
  },
  'cat-enamel': {
    bg: 'from-purple-50 via-fuchsia-50/40 to-violet-100/60 dark:from-purple-950/40 dark:via-fuchsia-950/20 dark:to-violet-900/30',
    badge: 'bg-purple-100/90 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60',
    badgeLabel: 'Enamel',
  },
  'cat-wood': {
    bg: 'from-orange-50 via-amber-50/40 to-orange-100/60 dark:from-orange-950/40 dark:via-amber-950/20 dark:to-orange-900/30',
    badge: 'bg-orange-100/90 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60',
    badgeLabel: 'Wood Care',
  },
  'cat-auto': {
    bg: 'from-slate-100 via-zinc-50 to-cyan-100/50 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-cyan-950/30',
    badge: 'bg-slate-200/90 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300/60 dark:border-slate-700',
    badgeLabel: 'Automotive',
  },
  'cat-marine': {
    bg: 'from-cyan-50 via-teal-50/40 to-cyan-100/60 dark:from-cyan-950/40 dark:via-teal-950/20 dark:to-cyan-900/30',
    badge: 'bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/60',
    badgeLabel: 'Marine',
  },
  'cat-waterproofing': {
    bg: 'from-blue-50 via-indigo-50/40 to-sky-100/60 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-sky-900/30',
    badge: 'bg-blue-100/90 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
    badgeLabel: 'Waterproof',
  },
  'cat-colorant': {
    bg: 'from-rose-50 via-pink-50/40 to-rose-100/60 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-rose-900/30',
    badge: 'bg-rose-100/90 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
    badgeLabel: 'Colorant',
  },
  'cat-specialty': {
    bg: 'from-stone-100 via-neutral-50 to-amber-100/40 dark:from-stone-900/50 dark:via-stone-900/30 dark:to-neutral-900/30',
    badge: 'bg-stone-200/90 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-stone-300/60 dark:border-stone-700',
    badgeLabel: 'Putty',
  },
};

const DEFAULT_STUDIO_STYLE: CategoryStudioStyle = {
  bg: 'from-slate-50 via-slate-50 to-slate-100/80 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/40',
  badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  badgeLabel: 'Paint',
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol,
  onSelect,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
  const studioStyle = CATEGORY_STUDIO_MAP[product.categoryId] || DEFAULT_STUDIO_STYLE;

  return (
    <div
      onClick={() => !isOutOfStock && onSelect(product)}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 p-3 shadow-xs transition-all duration-200 ${
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40'
          : 'hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-950/60 hover:-translate-y-0.5 cursor-pointer active:scale-98'
      }`}
    >
      {/* Product Image Container with Category Pastel Studio Background */}
      <div
        className={`relative aspect-4/3 w-full overflow-hidden rounded-xl bg-gradient-to-b ${studioStyle.bg} p-2 flex items-center justify-center mb-2.5 transition-colors`}
      >
        {/* Soft Grounded Contact Shadow */}
        <div className="absolute bottom-2.5 h-2 w-3/5 rounded-[100%] bg-slate-900/12 dark:bg-black/35 blur-[3px] pointer-events-none" />

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="relative z-10 h-full w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="relative z-10 flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <Package className="h-10 w-10 stroke-1" />
          </div>
        )}

        {/* Category Badge Pill */}
        <span
          className={`absolute top-2 left-2 z-20 rounded-md border px-1.5 py-0.5 text-[9px] font-bold shadow-2xs backdrop-blur-xs ${studioStyle.badge}`}
        >
          {studioStyle.badgeLabel}
        </span>

        {/* Floating Low Stock Warning Pill */}
        {isLowStock && (
          <span className="absolute top-2 right-2 z-20 rounded-lg bg-amber-500/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-extrabold text-slate-950 shadow-xs">
            Low ({product.stock})
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
            {product.nameBn || product.sku}
          </p>
        </div>

        {/* Price & Stock Row */}
        <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                {formatCurrency(product.salePrice, currencySymbol)}
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                MRP
              </span>
            </div>
            {product.costPrice > 0 && product.costPrice < product.salePrice && (
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono -mt-0.5">
                DP: {formatCurrency(product.costPrice, currencySymbol)} ({Math.round((1 - product.costPrice / product.salePrice) * 100)}% off)
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 shrink-0 ml-1">
            Stock: <strong className="font-bold text-slate-600 dark:text-slate-300">{product.stock}</strong> pcs
          </span>
        </div>
      </div>

      {/* Tactile + Add to cart Button (Matching Reference 1) */}
      <button
        type="button"
        disabled={isOutOfStock}
        onClick={(e) => {
          e.stopPropagation();
          if (!isOutOfStock) onSelect(product);
        }}
        className={`mt-2.5 flex w-full items-center justify-center gap-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
          isOutOfStock
            ? 'border-slate-200 text-slate-400 bg-slate-100 dark:border-slate-800 dark:bg-slate-800'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 shadow-2xs'
        }`}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add to cart</span>
      </button>
    </div>
  );
};
