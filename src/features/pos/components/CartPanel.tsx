import React, { useState } from 'react';
import {
  User,
  Trash2,
  Bookmark,
  ArrowDownCircle,
  Tag,
  CreditCard,
  ArrowLeft,
  Barcode,
} from 'lucide-react';
import type { StoreSettings } from '../../../types';
import { useCartStore } from '../../../store/useCartStore';
import { CartItemRow } from './CartItemRow';
import { CustomerPickerModal } from './CustomerPickerModal';
import { ParkedCartsModal } from './ParkedCartsModal';
import { PaymentModal } from '../payment/PaymentModal';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency } from '../../../utils/formatters';
import { useToastStore } from '../../../store/useToastStore';

interface CartPanelProps {
  settings: StoreSettings;
}

export const CartPanel: React.FC<CartPanelProps> = ({ settings }) => {
  const {
    items,
    customer,
    discountType,
    discountValue,
    holdCarts,
    setCustomer,
    setDiscount,
    updateQuantity,
    updateItemDiscount,
    removeItem,
    clearCart,
    parkCurrentCart,
    getSubtotal,
    getDiscountTotal,
    getTaxTotal,
    getGrandTotal,
    getTotalItemsCount,
  } = useCartStore();

  const showToast = useToastStore((s) => s.showToast);

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isParkedModalOpen, setIsParkedModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // Cart discount form state
  const [cartDiscountInput, setCartDiscountInput] = useState(discountValue.toString());
  const [cartDiscountTypeInput, setCartDiscountTypeInput] = useState(discountType);

  const subtotal = getSubtotal();
  const discountTotal = getDiscountTotal();
  const taxTotal = getTaxTotal();
  const grandTotal = getGrandTotal();
  const itemsCount = getTotalItemsCount();

  const handleParkCart = async () => {
    if (items.length === 0) return;
    const parked = await parkCurrentCart();
    if (parked) {
      showToast('Order Parked', `Order #${parked.holdNumber} has been placed on hold.`, 'info');
    }
  };

  const handleApplyCartDiscount = () => {
    const val = parseFloat(cartDiscountInput) || 0;
    setDiscount(cartDiscountTypeInput, val);
    setIsDiscountModalOpen(false);
    showToast('Discount Applied', 'Cart discount updated successfully.', 'success');
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none overflow-hidden">
      {/* 🌟 ZONE 3 HERO: THE GIANT TOTAL MONETARY ANCHOR (Eye lands here naturally) */}
      <div className="bg-slate-900 text-white p-5 dark:bg-slate-950 border-b border-slate-800 select-none">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
          <span>Net Payable Total</span>
          <span className="flex items-center gap-1 text-slate-300 font-bold">
            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="text-3xl lg:text-4xl font-black text-sky-400 tracking-tight font-mono">
          {formatCurrency(grandTotal, settings.currencySymbol)}
        </div>
      </div>

      {/* Secondary Bar: Customer & Parked Carts */}
      <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setIsCustomerModalOpen(true)}
          className="flex flex-1 items-center gap-2 rounded-xl bg-white p-2 text-left hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            <User className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {customer ? customer.name : 'Walk-in Customer'}
            </div>
            <div className="text-[10px] text-slate-400">
              {customer ? `Pts: ${customer.loyaltyPoints} • Due: ${formatCurrency(customer.currentDue, settings.currencySymbol)}` : 'Tap to attach customer (F8)'}
            </div>
          </div>
        </button>

        {/* Parked Carts Button */}
        <button
          type="button"
          onClick={() => setIsParkedModalOpen(true)}
          className="relative flex h-10 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
          title="Recall Parked Orders"
        >
          <ArrowDownCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <span>Parked</span>
          {holdCarts.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[10px] font-black text-white">
              {holdCarts.length}
            </span>
          )}
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 select-none">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 mb-3">
              <Barcode className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Ready for Next Customer
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-semibold mt-2 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 rounded-xl">
              <ArrowLeft className="w-3.5 h-3.5 animate-pulse" />
              <span>Scan barcode or tap items</span>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.productId}
              item={item}
              currencySymbol={settings.currencySymbol}
              onUpdateQuantity={updateQuantity}
              onUpdateDiscount={updateItemDiscount}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      {/* Calculation Breakdown & Action Bar */}
      <div className="border-t border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
        {/* Compact summary rows */}
        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {formatCurrency(subtotal, settings.currencySymbol)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                setCartDiscountInput(discountValue.toString());
                setCartDiscountTypeInput(discountType);
                setIsDiscountModalOpen(true);
              }}
              className="flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400 cursor-pointer font-bold"
            >
              <Tag className="w-3 h-3" />
              <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'}):</span>
            </button>
            <span className="font-bold text-rose-500">
              -{formatCurrency(discountTotal, settings.currencySymbol)}
            </span>
          </div>

          {settings.enableTax && (
            <div className="flex justify-between">
              <span>VAT ({settings.defaultTaxRate}%):</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                +{formatCurrency(taxTotal, settings.currencySymbol)}
              </span>
            </div>
          )}
        </div>

        {/* Secondary Action Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={items.length === 0}
            onClick={handleParkCart}
            className="text-xs font-bold"
          >
            <Bookmark className="w-3.5 h-3.5 mr-1 text-sky-600" />
            Park (F4)
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={items.length === 0}
            onClick={clearCart}
            className="text-xs font-bold hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" />
            Clear
          </Button>
        </div>

        {/* Big High-Confidence Checkout Button */}
        <Button
          type="button"
          variant="success"
          size="xl"
          disabled={items.length === 0}
          onClick={() => setIsPaymentModalOpen(true)}
          className="w-full h-14 text-base font-black shadow-lg shadow-emerald-600/25 cursor-pointer"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          PAY BILL • {formatCurrency(grandTotal, settings.currencySymbol)} (F9)
        </Button>
      </div>

      {/* Modals */}
      <CustomerPickerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        selectedCustomer={customer}
        onSelectCustomer={setCustomer}
        currencySymbol={settings.currencySymbol}
      />

      <ParkedCartsModal
        isOpen={isParkedModalOpen}
        onClose={() => setIsParkedModalOpen(false)}
        currencySymbol={settings.currencySymbol}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        settings={settings}
      />

      {/* Cart Discount Modal */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        title="Apply Cart Discount"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCartDiscountTypeInput('fixed')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                cartDiscountTypeInput === 'fixed'
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Fixed ({settings.currencySymbol})
            </button>
            <button
              type="button"
              onClick={() => setCartDiscountTypeInput('percentage')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                cartDiscountTypeInput === 'percentage'
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Percentage (%)
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Discount Value:
            </label>
            <input
              type="number"
              min="0"
              value={cartDiscountInput}
              onChange={(e) => setCartDiscountInput(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:text-white dark:border-slate-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDiscount('fixed', 0);
                setIsDiscountModalOpen(false);
              }}
            >
              Remove
            </Button>
            <Button variant="primary" onClick={handleApplyCartDiscount}>
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
