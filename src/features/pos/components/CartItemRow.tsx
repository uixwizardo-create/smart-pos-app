import React, { useState } from 'react';
import { Plus, Minus, Trash2, Tag } from 'lucide-react';
import type { OrderItem } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

interface CartItemRowProps {
  item: OrderItem;
  currencySymbol?: string;
  onUpdateQuantity: (productId: string, qty: number) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  currencySymbol = '৳',
  onUpdateQuantity,
  onUpdateDiscount,
  onRemove,
}) => {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountVal, setDiscountVal] = useState(item.discount.toString());

  const handleDiscountSubmit = () => {
    const val = parseFloat(discountVal) || 0;
    onUpdateDiscount(item.productId, val);
    setShowDiscountInput(false);
  };

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-3 shadow-2xs transition-all dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 dark:text-white">
            {item.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {formatCurrency(item.unitPrice, currencySymbol)} / {item.unit}
            </span>
            {item.discount > 0 && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.2 rounded-md">
                -{formatCurrency(item.discount, currencySymbol)} off
              </span>
            )}
          </div>
        </div>

        {/* Line Total */}
        <div className="text-right">
          <div className="text-sm font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(item.subtotal, currencySymbol)}
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* Quantity Controls */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Discount & Remove actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowDiscountInput(!showDiscountInput)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${
              item.discount > 0
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300'
            }`}
            title="Item Discount"
          >
            <Tag className="w-3 h-3" />
            <span>Discount</span>
          </button>

          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inline Item Discount Form */}
      {showDiscountInput && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2 border border-amber-200 dark:border-amber-900">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-200">
            Line Discount ({currencySymbol}):
          </span>
          <input
            type="number"
            min="0"
            value={discountVal}
            onChange={(e) => setDiscountVal(e.target.value)}
            className="h-7 w-20 rounded-md border border-amber-300 bg-white px-2 text-xs font-bold text-slate-900 focus:outline-none dark:bg-slate-900 dark:text-white dark:border-amber-800"
          />
          <button
            type="button"
            onClick={handleDiscountSubmit}
            className="rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};
