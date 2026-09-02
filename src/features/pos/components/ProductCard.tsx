import React from 'react';
import { Plus, Package } from 'lucide-react';
import type { Product } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol,
  onSelect,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;

  return (
    <div
      onClick={() => !isOutOfStock && onSelect(product)}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 p-3 shadow-xs transition-all duration-200 ${
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40'
          : 'hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-950/60 hover:-translate-y-0.5 cursor-pointer active:scale-98'
      }`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-2.5">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <Package className="h-10 w-10 stroke-1" />
          </div>
        )}

        {/* Floating Low Stock Warning Pill */}
        {isLowStock && (
          <span className="absolute top-2 right-2 rounded-lg bg-amber-500/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-extrabold text-slate-950 shadow-xs">
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
        <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            {formatCurrency(product.salePrice, currencySymbol)}
          </div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400">
            {product.stock} {product.unit}
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
