import React from 'react';
import { Plus, Package } from 'lucide-react';
import type { Product } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  onSelect: (product: Product) => void;
}

interface ProductStudioStyle {
  bg: string;
  badge: string;
  badgeLabel: string;
}

export function getProductStudioStyle(product: Product): ProductStudioStyle {
  const img = product.imageUrl || '';
  const name = (product.name + ' ' + (product.nameBn || '')).toLowerCase();

  // 1. Feather Silk Luxury Emulsion (Cyan / Deep Ocean Silk / White bucket)
  // Complement: Luminous icy cyan / sea-foam silk studio
  if (img.includes('feather-silk')) {
    return {
      bg: 'from-cyan-50/95 via-sky-50/60 to-teal-100/70 dark:from-cyan-950/45 dark:via-sky-950/25 dark:to-teal-900/35',
      badge: 'bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/60',
      badgeLabel: 'Feather Silk',
    };
  }

  // 2. Acroflat Synthetic Distemper (Rich Berry / Ruby Plum bucket)
  // Complement: Soft blush rose / berry mist studio
  if (img.includes('acroflat')) {
    return {
      bg: 'from-pink-50/95 via-rose-50/60 to-fuchsia-100/70 dark:from-pink-950/45 dark:via-rose-950/25 dark:to-fuchsia-900/35',
      badge: 'bg-pink-100/90 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300 border-pink-200/60 dark:border-pink-800/60',
      badgeLabel: 'Acroflat',
    };
  }

  // 3. Acroplast Plastic Paint (Vibrant Coral / Crimson Terracotta bucket)
  // Complement: Soft warm peach / coral sunrise studio
  if (img.includes('acroplast')) {
    return {
      bg: 'from-orange-50/95 via-rose-50/50 to-amber-100/70 dark:from-orange-950/45 dark:via-rose-950/25 dark:to-amber-900/35',
      badge: 'bg-orange-100/90 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60',
      badgeLabel: 'Acroplast',
    };
  }

  // 4. Anti-Bacterial Interior Emulsion (Botanical Green / Forest Emerald bucket)
  // Complement: Crisp herbal sage / botanical mint studio
  if (img.includes('anti-bacterial')) {
    return {
      bg: 'from-emerald-50/95 via-teal-50/50 to-green-100/70 dark:from-emerald-950/45 dark:via-teal-950/25 dark:to-green-900/35',
      badge: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
      badgeLabel: 'Anti-Bacterial',
    };
  }

  // 5. Weather Care Exterior Emulsion (Tropical Aqua-Teal / Sunshine bucket)
  // Complement: Fresh morning aqua-teal / sky breeze studio
  if (img.includes('weather-care-ext-emulsion')) {
    return {
      bg: 'from-teal-50/95 via-cyan-50/60 to-emerald-100/70 dark:from-teal-950/45 dark:via-cyan-950/25 dark:to-emerald-900/35',
      badge: 'bg-teal-100/90 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60',
      badgeLabel: 'Weather Care',
    };
  }

  // 6. Weather Care Exterior Sealer (Crimson Rust / Amber bucket)
  // Complement: Warm terracotta sunset / amber glow studio
  if (img.includes('weather-care-ext-sealer')) {
    return {
      bg: 'from-rose-50/95 via-orange-50/50 to-amber-100/70 dark:from-rose-950/45 dark:via-orange-950/25 dark:to-amber-900/35',
      badge: 'bg-rose-100/90 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
      badgeLabel: 'WC Sealer',
    };
  }

  // 7. All Rounder Interior & Exterior (Royal Violet / Twilight Indigo bucket)
  // Complement: Regal lavender / twilight lilac mist studio
  if (img.includes('all-rounder')) {
    return {
      bg: 'from-indigo-50/95 via-purple-50/50 to-violet-100/70 dark:from-indigo-950/45 dark:via-purple-950/25 dark:to-violet-900/35',
      badge: 'bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
      badgeLabel: 'All Rounder',
    };
  }

  // 8. Rockcem Cement Paint (Crisp Azure / Cloud Sky Blue bucket)
  // Complement: Soft azure / morning sky blue studio
  if (img.includes('rockcem')) {
    return {
      bg: 'from-sky-50/95 via-blue-50/50 to-cyan-100/70 dark:from-sky-950/45 dark:via-blue-950/25 dark:to-cyan-900/35',
      badge: 'bg-sky-100/90 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60',
      badgeLabel: 'Rockcem',
    };
  }

  // 9. Damp Proof Primer Sealer (Seafoam Mint / Turquoise Water Guard bucket)
  // Complement: Refreshing aquamarine seafoam mist studio
  if (img.includes('damp-proof')) {
    return {
      bg: 'from-teal-50/95 via-emerald-50/50 to-cyan-100/70 dark:from-teal-950/45 dark:via-emerald-950/25 dark:to-cyan-900/35',
      badge: 'bg-teal-100/90 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60',
      badgeLabel: 'Damp Proof',
    };
  }

  // 10. Water Based Sealer (Bright Tangerine / Golden Apricot bucket)
  // Complement: Warm sunburst apricot / golden honey studio
  if (img.includes('water-based-sealer')) {
    return {
      bg: 'from-amber-50/95 via-orange-50/50 to-yellow-100/70 dark:from-amber-950/45 dark:via-orange-950/25 dark:to-yellow-900/35',
      badge: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
      badgeLabel: 'Water Sealer',
    };
  }

  // 11. Water Based Putty (Warm Ochre Sand / Calcite bucket)
  // Complement: Soft warm limestone / sandstone cream studio
  if (img.includes('water-based-putty')) {
    return {
      bg: 'from-stone-100/95 via-amber-50/50 to-orange-100/60 dark:from-stone-900/50 dark:via-amber-950/25 dark:to-stone-800/40',
      badge: 'bg-stone-200/90 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-stone-300/60 dark:border-stone-700',
      badgeLabel: 'Wall Putty',
    };
  }

  // 12. Synglo Super Gloss Enamel (Brilliant Ruby Magenta / Wine Gloss can)
  // Complement: Luxury royal wine / rose mist studio
  if (img.includes('synglo')) {
    return {
      bg: 'from-fuchsia-50/95 via-pink-50/50 to-rose-100/70 dark:from-fuchsia-950/45 dark:via-pink-950/25 dark:to-rose-900/35',
      badge: 'bg-fuchsia-100/90 text-fuchsia-800 dark:bg-fuchsia-950/80 dark:text-fuchsia-300 border-fuchsia-200/60 dark:border-fuchsia-800/60',
      badgeLabel: 'Super Gloss',
    };
  }

  // 13. Synthetic Undercoat & Red Oxide (Olive Chromate / Zinc Slate can)
  // Complement: Platinum zinc / clean architectural slate studio
  if (img.includes('synthetic-undercoat')) {
    return {
      bg: 'from-slate-100/95 via-zinc-50 to-emerald-50/60 dark:from-slate-800/60 dark:via-zinc-800/40 dark:to-emerald-950/30',
      badge: 'bg-slate-200/90 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300/60 dark:border-slate-700',
      badgeLabel: 'Undercoat',
    };
  }

  // 14. Hammer Paint (Industrial Hammered Finish can)
  // Complement: Industrial cool steel / titanium slate studio
  if (img.includes('hammer-paint')) {
    return {
      bg: 'from-slate-100/95 via-zinc-100 to-slate-200/70 dark:from-slate-800/70 dark:via-zinc-800/50 dark:to-slate-800/40',
      badge: 'bg-slate-200/90 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300/60 dark:border-slate-700',
      badgeLabel: 'Hammer Tone',
    };
  }

  // 15. Wood Care & Varnish (Warm Cedar / Mahogany / Golden Honey can)
  // Complement: Rich warm golden honey / amber teak studio
  if (img.includes('wood-care')) {
    return {
      bg: 'from-amber-50/95 via-orange-50/50 to-yellow-100/70 dark:from-amber-950/45 dark:via-orange-950/25 dark:to-yellow-900/35',
      badge: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
      badgeLabel: 'Wood Care',
    };
  }

  // 16. Marine Paint & Sea Queen (Deep Ocean Navy & Coral Marine can)
  // Complement: Deep coastal sea breeze / nautical cyan-slate studio
  if (img.includes('marine-paint') || img.includes('sea-queen')) {
    return {
      bg: 'from-cyan-50/95 via-slate-50 to-teal-100/70 dark:from-cyan-950/45 dark:via-slate-800/35 dark:to-teal-900/35',
      badge: 'bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/60',
      badgeLabel: 'Marine',
    };
  }

  // 17. Epoxy & PU Floor Coating (Architectural Bronze / Epoxy can)
  // Complement: Modern champagne stone / travertine studio
  if (img.includes('self-leveling-epoxy') || img.includes('pu-floor')) {
    return {
      bg: 'from-stone-100/95 via-amber-50/40 to-neutral-200/60 dark:from-stone-900/50 dark:via-amber-950/25 dark:to-neutral-900/30',
      badge: 'bg-stone-200/90 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-stone-300/60 dark:border-stone-700',
      badgeLabel: 'Epoxy Floor',
    };
  }

  // 18. Osaka Auto Refinish (Racing Crimson Red & Metallic Silver / White can)
  // Complement: High-end showroom silver with subtle warm crimson reflection studio
  if (img.includes('osaka-auto')) {
    return {
      bg: 'from-slate-100/95 via-zinc-50 to-rose-50/70 dark:from-slate-800/65 dark:via-zinc-800/40 dark:to-rose-950/35',
      badge: 'bg-slate-200/90 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300/60 dark:border-slate-700',
      badgeLabel: 'Osaka Auto',
    };
  }

  // 19. Tinting Colorants (Specific pigment shades)
  if (img.includes('colorant')) {
    if (name.includes('magenta') || name.includes('violet')) {
      return {
        bg: 'from-fuchsia-50/95 via-purple-50/50 to-violet-100/70 dark:from-fuchsia-950/45 dark:via-purple-950/25 dark:to-violet-900/35',
        badge: 'bg-fuchsia-100/90 text-fuchsia-800 dark:bg-fuchsia-950/80 dark:text-fuchsia-300 border-fuchsia-200/60 dark:border-fuchsia-800/60',
        badgeLabel: 'Colorant',
      };
    }
    if (name.includes('red') || name.includes('oxide')) {
      return {
        bg: 'from-rose-50/95 via-red-50/50 to-rose-100/70 dark:from-rose-950/45 dark:via-red-950/25 dark:to-rose-900/35',
        badge: 'bg-rose-100/90 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
        badgeLabel: 'Colorant',
      };
    }
    if (name.includes('orange')) {
      return {
        bg: 'from-orange-50/95 via-amber-50/50 to-yellow-100/70 dark:from-orange-950/45 dark:via-amber-950/25 dark:to-yellow-900/35',
        badge: 'bg-orange-100/90 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60',
        badgeLabel: 'Colorant',
      };
    }
    if (name.includes('yellow')) {
      return {
        bg: 'from-yellow-50/95 via-amber-50/50 to-yellow-100/70 dark:from-yellow-950/45 dark:via-amber-950/25 dark:to-yellow-900/35',
        badge: 'bg-yellow-100/90 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border-yellow-200/60 dark:border-yellow-800/60',
        badgeLabel: 'Colorant',
      };
    }
    if (name.includes('green')) {
      return {
        bg: 'from-emerald-50/95 via-teal-50/50 to-green-100/70 dark:from-emerald-950/45 dark:via-teal-950/25 dark:to-green-900/35',
        badge: 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
        badgeLabel: 'Colorant',
      };
    }
    if (name.includes('blue')) {
      return {
        bg: 'from-sky-50/95 via-blue-50/50 to-cyan-100/70 dark:from-sky-950/45 dark:via-blue-950/25 dark:to-cyan-900/35',
        badge: 'bg-sky-100/90 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/60',
        badgeLabel: 'Colorant',
      };
    }
    if (name.includes('umber') || name.includes('brown')) {
      return {
        bg: 'from-amber-50/95 via-stone-50/50 to-amber-100/70 dark:from-amber-950/45 dark:via-stone-950/25 dark:to-amber-900/35',
        badge: 'bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
        badgeLabel: 'Colorant',
      };
    }
    if (name.includes('black')) {
      return {
        bg: 'from-slate-100/95 via-zinc-100 to-slate-200/70 dark:from-slate-800/70 dark:via-zinc-800/50 dark:to-slate-800/40',
        badge: 'bg-slate-200/90 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300/60 dark:border-slate-700',
        badgeLabel: 'Colorant',
      };
    }
    return {
      bg: 'from-slate-50/95 via-white to-slate-100/70 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-800/40',
      badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      badgeLabel: 'Colorant',
    };
  }

  // Default fallback
  return {
    bg: 'from-slate-50 via-slate-50 to-slate-100/80 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/40',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    badgeLabel: 'Paint',
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol,
  onSelect,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
  const studioStyle = getProductStudioStyle(product);

  return (
    <div
      onClick={() => !isOutOfStock && onSelect(product)}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 p-3 shadow-xs transition-all duration-200 ${
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40'
          : 'hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-950/60 hover:-translate-y-0.5 cursor-pointer active:scale-98'
      }`}
    >
      {/* Product Image Container with Bucket-Complementary Studio Background & Lighting */}
      <div
        className={`relative aspect-4/3 w-full overflow-hidden rounded-xl bg-gradient-to-b ${studioStyle.bg} p-2 flex items-center justify-center mb-2.5 transition-colors`}
      >
        {/* Soft Radial Studio Spotlight behind Bucket */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.75)_0%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_75%)] pointer-events-none" />

        {/* Soft Grounded Contact Floor Shadow */}
        <div className="absolute bottom-2.5 h-2 w-3/5 rounded-[100%] bg-slate-900/15 dark:bg-black/45 blur-[3px] pointer-events-none" />

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

        {/* Bucket-Matched Studio Pill Badge */}
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
