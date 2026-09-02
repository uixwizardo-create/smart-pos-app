import React, { useState } from 'react';
import {
  User,
  Trash2,
  Bookmark,
  Sparkles,
  Percent,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import type { StoreSettings } from '../../../types';
import { useCartStore } from '../../../store/useCartStore';
import { CartItemRow } from './CartItemRow';
import { CustomerPickerModal } from './CustomerPickerModal';
import { ParkedCartsModal } from './ParkedCartsModal';
import { PaymentModal } from '../payment/PaymentModal';
import { formatCurrency } from '../../../utils/formatters';
import { useToastStore } from '../../../store/useToastStore';

interface CartPanelProps {
  settings: StoreSettings;
}

export const CartPanel: React.FC<CartPanelProps> = ({ settings }) => {
  const {
    items,
    customer,
    updateQuantity,
    removeItem,
    clearCart,
    parkCurrentCart,
    holdCarts,
    setCustomer,
    setDiscount,
    discountType,
    discountValue,
    getSubtotal,
    getTaxTotal,
    getDiscountTotal,
    getGrandTotal,
    getTotalItemsCount,
  } = useCartStore();

  const [isCustomerPickerOpen, setIsCustomerPickerOpen] = useState(false);
  const [isParkedModalOpen, setIsParkedModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountVal, setDiscountVal] = useState(discountValue ? discountValue.toString() : '');
  const [localDiscountType, setLocalDiscountType] = useState<'percentage' | 'fixed'>(discountType);

  const showToast = useToastStore((s) => s.showToast);

  const subtotal = getSubtotal();
  const taxAmount = getTaxTotal();
  const discountTotal = getDiscountTotal();
  const grandTotal = getGrandTotal();
  const totalItems = getTotalItemsCount();

  const handleHoldCart = async () => {
    if (items.length === 0) return;
    await parkCurrentCart();
    showToast('Order Parked', 'Current order has been saved to parked list (F4)', 'info');
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(discountVal) || 0;
    setDiscount(localDiscountType, val);
    setIsDiscountOpen(false);
    showToast('Discount Applied', `${val}${localDiscountType === 'percentage' ? '%' : settings.currencySymbol} cart discount applied`, 'success');
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden select-none">
      {/* 🏷️ "Detail Items" HEADER (Matching Reference 1 & 3) */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            Detail Items
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
          </p>
        </div>

        <div className="flex items-center gap-1">
          {/* Parked / Held Carts Trigger */}
          {holdCarts.length > 0 && (
            <button
              type="button"
              onClick={() => setIsParkedModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800"
              title="Parked Carts"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{holdCarts.length}</span>
            </button>
          )}

          {/* Park Cart (F4) */}
          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleHoldCart}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
            title="Park Order (F4)"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Clear Cart */}
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => clearCart()}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-30 cursor-pointer"
            title="Clear Cart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 👤 CUSTOMER SELECTOR BAR (F8) */}
      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 shrink-0">
        <button
          type="button"
          onClick={() => setIsCustomerPickerOpen(true)}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs font-semibold cursor-pointer hover:border-emerald-500 transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="truncate text-slate-800 dark:text-slate-200">
              {customer ? customer.name : 'Walk-in Customer'}
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
            F8
          </span>
        </button>
      </div>

      {/* 🛒 ITEM LIST */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400">
            <Sparkles className="h-10 w-10 text-slate-300 dark:text-slate-700 stroke-1 mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Cart is empty
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click items or scan barcode to begin
            </p>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.productId}
              item={item}
              currencySymbol={settings.currencySymbol}
              onUpdateQty={updateQuantity}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      {/* 💳 FINANCIAL BREAKDOWN ("Detail Payment" - Matching Reference 1 & 3) */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Sub total</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {formatCurrency(subtotal, settings.currencySymbol)}
          </span>
        </div>

        {settings.enableTax && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tax ({settings.defaultTaxRate}%)</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              +{formatCurrency(taxAmount, settings.currencySymbol)}
            </span>
          </div>
        )}

        {/* Discount Row */}
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setIsDiscountOpen(!isDiscountOpen)}
            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
          >
            <Percent className="w-3 h-3" />
            <span>Discount {discountValue > 0 ? `(${discountValue}${discountType === 'percentage' ? '%' : ''})` : ''}</span>
          </button>
          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            -{formatCurrency(discountTotal, settings.currencySymbol)}
          </span>
        </div>

        {/* Discount Inline Form */}
        {isDiscountOpen && (
          <form onSubmit={handleApplyDiscount} className="flex gap-1.5 pt-1">
            <input
              type="number"
              placeholder="0.00"
              value={discountVal}
              onChange={(e) => setDiscountVal(e.target.value)}
              className="h-8 w-20 rounded-lg border border-slate-300 bg-white px-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setLocalDiscountType(localDiscountType === 'percentage' ? 'fixed' : 'percentage')}
              className="h-8 px-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs font-bold"
            >
              {localDiscountType === 'percentage' ? '%' : settings.currencySymbol}
            </button>
            <button
              type="submit"
              className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold"
            >
              Apply
            </button>
          </form>
        )}

        {/* Dotted Divider */}
        <div className="border-b border-dashed border-slate-200 dark:border-slate-700 my-1" />

        {/* Total Payment Row */}
        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
            Total Payment
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {formatCurrency(grandTotal, settings.currencySymbol)}
          </span>
        </div>

        {/* 🟢 RADIANT EMERALD CHECKOUT CTA (Matching Reference 1 & 3 "Place an Order") */}
        <button
          type="button"
          disabled={items.length === 0}
          onClick={() => setIsPaymentModalOpen(true)}
          className={`mt-2 flex w-full items-center justify-between p-3.5 rounded-2xl text-white font-black text-sm transition-all shadow-lg ${
            items.length === 0
              ? 'bg-slate-300 dark:bg-slate-800 opacity-50 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 hover:shadow-emerald-600/50 cursor-pointer active:scale-98'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Place an Order</span>
          </span>

          <span className="px-2.5 py-1 rounded-xl bg-emerald-700/60 text-xs font-mono font-bold">
            F9
          </span>
        </button>
      </div>

      {/* Customer Picker Modal */}
      <CustomerPickerModal
        isOpen={isCustomerPickerOpen}
        onClose={() => setIsCustomerPickerOpen(false)}
        onSelectCustomer={(c) => {
          setCustomer(c);
          setIsCustomerPickerOpen(false);
        }}
        selectedCustomer={customer}
        currencySymbol={settings.currencySymbol}
      />

      {/* Parked Carts Modal */}
      <ParkedCartsModal
        isOpen={isParkedModalOpen}
        onClose={() => setIsParkedModalOpen(false)}
        currencySymbol={settings.currencySymbol}
      />

      {/* Checkout & Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        settings={settings}
      />
    </div>
  );
};
