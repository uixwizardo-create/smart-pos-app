import React from 'react';
import type { Order, StoreSettings } from '../../../types';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

export type ReceiptPriceMode = 'mrp' | 'dp' | 'both';

interface ReceiptViewProps {
  order: Order;
  settings: StoreSettings;
  priceMode?: ReceiptPriceMode;
}

export const ReceiptView = React.forwardRef<HTMLDivElement, ReceiptViewProps>(
  ({ order, settings, priceMode }, ref) => {
    const is58mm = settings.paperSize === '58mm';
    const effectivePriceMode: ReceiptPriceMode =
      priceMode || settings.defaultReceiptPriceMode || 'mrp';

    // Computations for MRP vs DP
    const mrpSubtotal = order.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const dpSubtotal = order.items.reduce(
      (sum, item) => sum + (item.costPrice || 0) * item.quantity,
      0
    );
    const dealerSavings = Math.max(0, mrpSubtotal - dpSubtotal);
    const savingsPercent =
      mrpSubtotal > 0 ? Math.round((dealerSavings / mrpSubtotal) * 100) : 0;

    return (
      <div
        ref={ref}
        id="printable-receipt"
        className={`bg-white text-black p-4 font-mono leading-tight mx-auto text-xs ${
          is58mm ? 'max-w-[240px] text-[11px]' : 'max-w-[340px] text-[12px]'
        }`}
        style={{ marginLeft: 'auto', marginRight: 'auto' }}
      >
        {/* Header */}
        <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
          <h2 className="text-base font-black tracking-wide uppercase">
            {settings.storeName}
          </h2>
          {settings.storeNameBn && (
            <p className="text-[11px] font-sans font-semibold">
              {settings.storeNameBn}
            </p>
          )}
          <p className="text-[11px] text-gray-700">{settings.address}</p>
          <p className="text-[11px] text-gray-700">Phone: {settings.phone}</p>
          {settings.vatRegistrationNumber && (
            <p className="text-[10px] text-gray-600">
              VAT/BIN: {settings.vatRegistrationNumber}
            </p>
          )}
          <div className="pt-1 text-[10px] font-bold tracking-widest uppercase">
            {effectivePriceMode === 'mrp' && '*** RETAIL INVOICE ***'}
            {effectivePriceMode === 'dp' && '*** DEALER INVOICE (DP) ***'}
            {effectivePriceMode === 'both' && '*** DEALER & MRP INVOICE ***'}
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[11px]">
          <div className="flex justify-between">
            <span>Invoice:</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{order.cashierName}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span className="font-medium">{order.customerName || 'Walk-in'}</span>
          </div>
          {order.customerPhone && order.customerPhone !== '00000000000' && (
            <div className="flex justify-between">
              <span>Cust Phone:</span>
              <span>{order.customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>Price Mode:</span>
            <span className="font-bold uppercase">
              {effectivePriceMode === 'mrp' && 'MRP (Retail)'}
              {effectivePriceMode === 'dp' && 'DP (Dealer)'}
              {effectivePriceMode === 'both' && 'Both (MRP & DP)'}
            </span>
          </div>
        </div>

        {/* Itemized List - 2-Line Thermal Standard Format (Zero Collision Guarantee) */}
        <div className="py-2 border-b border-dashed border-gray-400 space-y-2">
          <div className="flex justify-between text-[10px] uppercase font-bold text-gray-700 pb-1 border-b border-gray-300">
            <span>Description / Item</span>
            <span>Total</span>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item, idx) => {
              const itemDpTotal = (item.costPrice || 0) * item.quantity;
              const activeTotal =
                effectivePriceMode === 'mrp' ? item.subtotal : itemDpTotal;

              return (
                <div key={idx} className="py-1.5 text-[11px] space-y-0.5">
                  {/* Line 1: Item Name (Full Width, never truncated) */}
                  <div className="font-bold text-gray-900 leading-snug">
                    {item.name}
                  </div>

                  {/* Line 2: Qty × Rate Breakdown on Left, Line Total on Right */}
                  <div className="flex items-baseline justify-between text-gray-700 pt-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className="font-semibold text-black">
                        {item.quantity} {item.unit || 'pc'} ×
                      </span>

                      {effectivePriceMode === 'mrp' && (
                        <span>{formatCurrency(item.unitPrice, settings.currencySymbol)}</span>
                      )}

                      {effectivePriceMode === 'dp' && (
                        <span>
                          <span className="font-bold text-black">
                            {formatCurrency(item.costPrice || 0, settings.currencySymbol)}
                          </span>{' '}
                          <span className="text-[9px] text-gray-500">(DP)</span>
                        </span>
                      )}

                      {effectivePriceMode === 'both' && (
                        <span className="inline-flex items-center gap-1 font-mono">
                          <span className="line-through text-gray-400">
                            {formatCurrency(item.unitPrice, settings.currencySymbol)}
                          </span>
                          <span>→</span>
                          <span className="font-bold text-gray-900">
                            {formatCurrency(item.costPrice || 0, settings.currencySymbol)}
                          </span>
                        </span>
                      )}

                      {effectivePriceMode === 'both' && item.costPrice < item.unitPrice && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                          Save: {formatCurrency((item.unitPrice - item.costPrice) * item.quantity, settings.currencySymbol)}
                        </span>
                      )}

                      {item.discount > 0 && effectivePriceMode === 'mrp' && (
                        <span className="text-[9px] text-gray-500">
                          (Disc: -{formatCurrency(item.discount, settings.currencySymbol)})
                        </span>
                      )}
                    </div>

                    {/* Right-aligned Line Total */}
                    <div className="font-black text-gray-900 font-mono text-[11px] shrink-0 pl-2">
                      {formatCurrency(activeTotal, settings.currencySymbol)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Breakdown */}
        <div className="py-2 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
          {effectivePriceMode === 'mrp' && (
            <>
              <div className="flex justify-between">
                <span>Subtotal ({order.itemsCount} items):</span>
                <span>{formatCurrency(order.subtotal, settings.currencySymbol)}</span>
              </div>

              {order.discountTotal > 0 && (
                <div className="flex justify-between font-medium text-gray-700">
                  <span>Total Discount:</span>
                  <span>-{formatCurrency(order.discountTotal, settings.currencySymbol)}</span>
                </div>
              )}

              {order.taxTotal > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>VAT / Tax ({order.taxRatePercent}%):</span>
                  <span>+{formatCurrency(order.taxTotal, settings.currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-300">
                <span>NET TOTAL:</span>
                <span>{formatCurrency(order.grandTotal, settings.currencySymbol)}</span>
              </div>
            </>
          )}

          {effectivePriceMode === 'dp' && (
            <>
              <div className="flex justify-between">
                <span>DP Total ({order.itemsCount} items):</span>
                <span>{formatCurrency(dpSubtotal, settings.currencySymbol)}</span>
              </div>

              <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-300">
                <span>NET DP PAYABLE:</span>
                <span>{formatCurrency(dpSubtotal, settings.currencySymbol)}</span>
              </div>
            </>
          )}

          {effectivePriceMode === 'both' && (
            <>
              <div className="flex justify-between text-gray-600">
                <span>Total MRP Value:</span>
                <span className="line-through">{formatCurrency(mrpSubtotal, settings.currencySymbol)}</span>
              </div>

              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Dealer Discount:</span>
                <span>-{formatCurrency(dealerSavings, settings.currencySymbol)} ({savingsPercent}%)</span>
              </div>

              <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-300">
                <span>NET DP PAYABLE:</span>
                <span>{formatCurrency(dpSubtotal, settings.currencySymbol)}</span>
              </div>

              <div className="text-center pt-1 text-[10px] font-bold text-gray-700 uppercase">
                *** You Save: {formatCurrency(dealerSavings, settings.currencySymbol)} at Dealer Rate ***
              </div>
            </>
          )}
        </div>

        {/* Payment Details */}
        <div className="py-2 border-b border-dashed border-gray-400 space-y-0.5 text-[11px]">
          <div className="flex justify-between">
            <span className="capitalize">Method:</span>
            <span className="font-bold uppercase">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid Amount:</span>
            <span className="font-bold">
              {formatCurrency(
                effectivePriceMode === 'mrp' ? order.paidAmount : Math.min(order.paidAmount, dpSubtotal),
                settings.currencySymbol
              )}
            </span>
          </div>
          {order.changeAmount > 0 && effectivePriceMode === 'mrp' && (
            <div className="flex justify-between font-bold">
              <span>Change Returned:</span>
              <span>{formatCurrency(order.changeAmount, settings.currencySymbol)}</span>
            </div>
          )}
          {order.dueAmount > 0 && effectivePriceMode === 'mrp' && (
            <div className="flex justify-between font-bold text-red-600">
              <span>Current Due Balance:</span>
              <span>{formatCurrency(order.dueAmount, settings.currencySymbol)}</span>
            </div>
          )}
        </div>

        {/* Footer Notes */}
        <div className="text-center pt-3 space-y-1 text-[10px] text-gray-600">
          <p className="font-bold text-black">{settings.receiptHeaderNote}</p>
          <p>{settings.receiptFooterNote}</p>
          <p className="pt-1 text-[9px] font-mono text-gray-400">
            POS App • www.quickmartpos.com
          </p>
        </div>
      </div>
    );
  }
);

ReceiptView.displayName = 'ReceiptView';
