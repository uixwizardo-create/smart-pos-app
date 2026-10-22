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

        {/* Itemized Table */}
        <div className="py-2 border-b border-dashed border-gray-400">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-300 text-[10px] uppercase font-bold">
                <th className="pb-1">Item</th>
                <th className="pb-1 text-center">Qty</th>
                <th className="pb-1 text-right">
                  {effectivePriceMode === 'mrp' && 'Price'}
                  {effectivePriceMode === 'dp' && 'DP Rate'}
                  {effectivePriceMode === 'both' && 'Rate (MRP/DP)'}
                </th>
                <th className="pb-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, idx) => {
                const itemDpTotal = (item.costPrice || 0) * item.quantity;
                const itemMrpTotal = item.unitPrice * item.quantity;

                return (
                  <tr key={idx} className="align-top text-[11px]">
                    <td className="py-1 pr-1">
                      <div className="font-semibold">{item.name}</div>
                      {item.discount > 0 && effectivePriceMode === 'mrp' && (
                        <div className="text-[9px] text-gray-500">
                          (Disc: -{formatCurrency(item.discount, settings.currencySymbol)})
                        </div>
                      )}
                      {effectivePriceMode === 'both' && item.costPrice < item.unitPrice && (
                        <div className="text-[9px] text-emerald-700">
                          (DP Save: {formatCurrency(item.unitPrice - item.costPrice, settings.currencySymbol)}/pc)
                        </div>
                      )}
                    </td>
                    <td className="py-1 text-center font-medium">
                      {item.quantity}
                    </td>

                    {/* Unit Rate Column */}
                    <td className="py-1 text-right text-gray-700">
                      {effectivePriceMode === 'mrp' && (
                        <span>{formatCurrency(item.unitPrice, settings.currencySymbol)}</span>
                      )}
                      {effectivePriceMode === 'dp' && (
                        <span>{formatCurrency(item.costPrice || 0, settings.currencySymbol)}</span>
                      )}
                      {effectivePriceMode === 'both' && (
                        <div className="leading-tight">
                          <div className="text-[10px] text-gray-400 line-through">
                            {formatCurrency(item.unitPrice, settings.currencySymbol)}
                          </div>
                          <div className="font-bold text-gray-900">
                            {formatCurrency(item.costPrice || 0, settings.currencySymbol)}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Subtotal Column */}
                    <td className="py-1 text-right font-bold">
                      {effectivePriceMode === 'mrp' && (
                        <span>{formatCurrency(item.subtotal, settings.currencySymbol)}</span>
                      )}
                      {effectivePriceMode === 'dp' && (
                        <span>{formatCurrency(itemDpTotal, settings.currencySymbol)}</span>
                      )}
                      {effectivePriceMode === 'both' && (
                        <div className="leading-tight">
                          <div className="text-[10px] text-gray-400 line-through font-normal">
                            {formatCurrency(itemMrpTotal, settings.currencySymbol)}
                          </div>
                          <div className="font-bold text-gray-900">
                            {formatCurrency(itemDpTotal, settings.currencySymbol)}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
