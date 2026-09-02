import React from 'react';
import { Plus, Minus, Trash2, Package } from 'lucide-react';
import type { OrderItem } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface CartItemRowProps {
  item: OrderItem;
  currencySymbol: string;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  currencySymbol,
  onUpdateQty,
  onRemove,
}) => {
  return (
    <div className="group flex items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/80">
      {/* Thumbnail */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-10 w-10 rounded-lg object-cover bg-white shrink-0 border border-slate-200/60 dark:border-slate-700"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-400 shrink-0 border border-slate-200/60 dark:border-slate-700">
          <Package className="h-5 w-5 stroke-1" />
        </div>
      )}

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
          {item.name}
        </h4>
        <div className="text-[10px] text-slate-400 font-medium">
          {formatCurrency(item.unitPrice, currencySymbol)} / {item.unit}
        </div>
      </div>

      {/* Tactile Quantity Stepper (- 1 +) (Matching Reference 1 & 3) */}
      <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 p-0.5 rounded-lg">
        <button
          type="button"
          onClick={() => {
            if (item.quantity > 1) {
              onUpdateQty(item.productId, item.quantity - 1);
            } else {
              onRemove(item.productId);
            }
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Decrease quantity"
        >
          {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-500" /> : <Minus className="w-3 h-3" />}
        </button>

        <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white font-mono">
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Line Total */}
      <div className="text-right min-w-[58px] shrink-0 font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
        {formatCurrency(item.subtotal, currencySymbol)}
      </div>
    </div>
  );
};
