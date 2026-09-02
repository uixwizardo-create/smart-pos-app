import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  FileText,
  Search,
  Printer,
  Eye,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import type { Order, StoreSettings } from '../../types';
import { OrderService } from '../../services/order.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ReceiptView } from '../pos/receipt/ReceiptView';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface SalesHistoryScreenProps {
  settings: StoreSettings;
}

export const SalesHistoryScreen: React.FC<SalesHistoryScreenProps> = ({ settings }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: selectedOrder ? `Invoice-${selectedOrder.orderNumber}` : 'Invoice',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const list = await OrderService.getAllOrders();
    setOrders(list);
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.includes(q))
    );
  });

  const getMethodIcon = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-3.5 h-3.5" />;
      case 'bkash':
      case 'nagad':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'card':
        return <CreditCard className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 space-y-4 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Sales History & Invoices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review past transactions, inspect line items, and reprint receipts
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-2xl border border-slate-200/80 bg-white pl-10 pr-3 text-xs sm:text-sm font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-xs text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/90 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5 hidden sm:table-cell">Date & Time</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5 text-center hidden sm:table-cell">Items</th>
                <th className="px-4 py-3.5 hidden md:table-cell">Method</th>
                <th className="px-4 py-3.5 text-right">Grand Total</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No sales invoices found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono hidden sm:table-cell">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white">
                      {order.customerName || 'Walk-in'}
                    </td>
                    <td className="px-4 py-3 text-center text-xs hidden sm:table-cell">
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-bold font-mono">
                        {order.itemsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                        {getMethodIcon(order.paymentMethod)}
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white text-xs sm:text-sm font-mono">
                      {formatCurrency(order.grandTotal, settings.currencySymbol)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsReceiptModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View & Print Receipt Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title={`Receipt Preview - ${selectedOrder.orderNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 max-h-[60vh] overflow-y-auto">
              <ReceiptView
                ref={receiptRef}
                order={selectedOrder}
                settings={settings}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsReceiptModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handlePrint()}
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
