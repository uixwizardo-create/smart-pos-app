import React from 'react';
import { Package } from 'lucide-react';
import type { Product } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface ProductCardProps {
  product: Product;
  currencySymbol?: string;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol = '৳',
  onSelect,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;

  return (
    <button
      type="button"
      onClick={() => !isOutOfStock && onSelect(product)}
      disabled={isOutOfStock}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-3.5 text-left transition-all duration-200 select-none ${
        isOutOfStock
          ? 'cursor-not-allowed border-slate-200 opacity-40 dark:border-slate-800'
          : 'cursor-pointer border-slate-200/80 hover:border-sky-500 hover:shadow-lg hover:shadow-sky-500/10 active:scale-97 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-sky-400'
      }`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-108"
          />
        ) : (
          <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
        )}

        {/* Stock Badge Overlay (Only when relevant to reduce noise) */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center">
            <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              Out of Stock
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2 right-2">
            <span className="rounded-lg bg-amber-500/95 backdrop-blur-2xs px-2 py-0.5 text-[10px] font-black text-slate-950 shadow-xs">
              {product.stock} left
            </span>
          </div>
        ) : null}
      </div>

      {/* Product Info - Minimal, Bold & Highly Readable */}
      <div className="mt-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {product.name}
          </h3>
          {product.nameBn && (
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
              {product.nameBn}
            </p>
          )}
        </div>

        {/* Price Tag Hero */}
        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
            {formatCurrency(product.salePrice, currencySymbol)}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            /{product.unit}
          </span>
        </div>
      </div>
    </button>
  );
};
