import React from 'react';
import { Plus, Package } from 'lucide-react';
import type { Product } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

export interface ParsedProductInfo {
  cleanName: string;
  lineName: string;
  sizeTag: string | null;
  baseTag: string | null;
}

export function parseProductInfo(rawName: string): ParsedProductInfo {
  let name = rawName.replace(/^Rainbow\s+/i, '').trim();

  // 1. Expand standard paint catalog abbreviations
  name = name.replace(/^WC\s+/i, 'Weather Care ');
  name = name.replace(/^APE\s+/i, 'Acroplast Emulsion ');
  name = name.replace(/^SSE\s+/i, 'Synglo Enamel ');
  name = name.replace(/^SPD\s+/i, 'Acroflat Distemper ');
  name = name.replace(/^All Round Exterior Top Coat\s+/i, 'All Rounder Ext ');

  // 2. Extract Size (e.g. (18 Ltr), (0.91 Lit), (1Ltr.), (15kg Bucket), - 1000 ml, 0.200 Ltr, etc.)
  let sizeTag: string | null = null;
  const parenMatch = name.match(/\(([\d\.]+\s*(?:ltr|lit|itr|lt|kg|ml|gm|l)[\w\.\s]*)\)/i);
  if (parenMatch) {
    sizeTag = parenMatch[1]
      .replace(/\s*bucket/i, '')
      .replace(/\s+/g, '')
      .replace(/ltr\.?|lit|itr|lt/i, 'L')
      .replace(/ml/i, 'ml')
      .replace(/kg/i, 'kg');
    name = name.replace(parenMatch[0], '').trim();
  } else {
    const trailMatch = name.match(/(?:-|\s)\s*([\d\.]+\s*(?:ltr|lit|itr|lt|kg|ml|gm|l))\b/i);
    if (trailMatch) {
      sizeTag = trailMatch[1]
        .replace(/\s+/g, '')
        .replace(/ltr\.?|lit|itr|lt/i, 'L')
        .replace(/ml/i, 'ml')
        .replace(/kg/i, 'kg');
      name = name.replace(trailMatch[0], '').trim();
    }
  }

  // 3. Extract Base (RB-1, RB-2, RB-3, RB-N)
  let baseTag: string | null = null;
  const baseMatch = name.match(/\b(RB-[123N])\b/i);
  if (baseMatch) {
    baseTag = baseMatch[1].toUpperCase();
    name = name.replace(baseMatch[0], '').replace(/\s+-\s+/, ' ').trim();
  }

  // 4. Clean Colorant Names
  if (name.startsWith('Bank Colorant-')) {
    name = 'Colorant ' + name.replace('Bank Colorant-', '').replace(/-\s*1000\s*ml/i, '');
  }

  // 5. Clean trailing hyphens or extra whitespace
  name = name.replace(/\s*-\s*$/, '').replace(/\s+/g, ' ').trim();

  const cleanName = baseTag ? `${name} (${baseTag})` : name;
  return { cleanName, lineName: name, sizeTag, baseTag };
}

function getBaseBadgeClasses(base: string): string {
  switch (base) {
    case 'RB-1':
      return 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60';
    case 'RB-2':
      return 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60';
    case 'RB-3':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60';
    case 'RB-N':
      return 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}


interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onSelect: (product: Product) => void;
  showCost?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol,
  onSelect,
  showCost = false,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
  const { lineName, sizeTag, baseTag } = parseProductInfo(product.name);

  return (
    <div
      onClick={() => !isOutOfStock && onSelect(product)}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 p-2.5 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 select-none cursor-pointer ${
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40'
          : 'active:scale-98'
      }`}
    >
      {/* 🖼️ Product Packshot Canvas — Neutral Studio Gallery Pedestal */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-50/90 to-slate-100/60 dark:from-slate-800/40 dark:to-slate-800/20 p-3 flex items-center justify-center mb-2 transition-colors">
        {/* Soft Natural Ambient Shadow beneath Packshot */}
        <div className="absolute bottom-2.5 h-1.5 w-3/5 rounded-[100%] bg-slate-900/[0.07] dark:bg-black/35 blur-[2.5px] pointer-events-none" />

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="relative z-10 h-full w-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)] transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="relative z-10 flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <Package className="h-10 w-10 stroke-1" />
          </div>
        )}

        {/* Top-Left: Tint Base Micro-Chip (ONLY when base exists — zero clutter on regular products) */}
        {baseTag && (
          <div className="absolute top-2 left-2 z-20 flex items-center">
            <span
              className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold tracking-wider font-mono shadow-2xs ${getBaseBadgeClasses(
                baseTag
              )}`}
            >
              {baseTag}
            </span>
          </div>
        )}

        {/* Top-Right: Stock Alert ONLY when Out of Stock or Low Stock */}
        {isOutOfStock ? (
          <div className="absolute top-2 right-2 z-20">
            <span className="rounded-md bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-semibold shadow-2xs">
              Out of stock
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2 right-2 z-20">
            <span className="rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-semibold shadow-2xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Low: {product.stock}
            </span>
          </div>
        ) : null}

        {/* Hover Quick-Add Tactile Indicator */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-150 translate-y-1 group-hover:translate-y-0 pointer-events-none">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* 🏷️ Product Typographic Details — Calm, Unboxed, Hero Image Focus */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="text-xs sm:text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
            title={product.name}
          >
            {lineName}
          </h3>
        </div>

        {/* Clean Single-Line Price & Meta Row (Zero Border/Box Clutter) */}
        <div className="flex items-baseline justify-between mt-1.5">
          <div className="flex flex-col">
            <span className="text-sm sm:text-[14px] font-semibold text-slate-900 dark:text-white font-mono tracking-tight leading-none">
              {formatCurrency(product.salePrice, currencySymbol)}
            </span>
            {showCost && product.costPrice > 0 && (
              <span className="text-[9px] font-medium text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                DP: {formatCurrency(product.costPrice, currencySymbol)} ({Math.round((1 - product.costPrice / product.salePrice) * 100)}%)
              </span>
            )}
          </div>

          {/* Calm, unboxed size and stock label */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
            {sizeTag && (
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {sizeTag}
              </span>
            )}
            {sizeTag && !isOutOfStock && !isLowStock && <span>•</span>}
            {!isOutOfStock && !isLowStock && (
              <span>{product.stock} pcs</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
