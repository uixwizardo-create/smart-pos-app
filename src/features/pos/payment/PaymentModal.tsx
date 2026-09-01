import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import confetti from 'canvas-confetti';
import {
  Banknote,
  CreditCard,
  Smartphone,
  Layers,
  Printer,
  CheckCircle,
} from 'lucide-react';
import type { PaymentMethod, Order, StoreSettings, PaymentSplit } from '../../../types';
import { useCartStore } from '../../../store/useCartStore';
import { useRegisterStore } from '../../../store/useRegisterStore';
import { OrderService } from '../../../services/order.service';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Numpad } from '../../../components/ui/Numpad';
import { ReceiptView } from '../receipt/ReceiptView';
import { formatCurrency } from '../../../utils/formatters';
import { soundManager } from '../../../utils/audio';
import { useToastStore } from '../../../store/useToastStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const {
    items,
    customer,
    discountType,
    discountValue,
    getSubtotal,
    getDiscountTotal,
    getTaxTotal,
    getGrandTotal,
    getTotalItemsCount,
    clearCart,
  } = useCartStore();

  const currentShift = useRegisterStore((s) => s.currentShift);
  const showToast = useToastStore((s) => s.showToast);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderedAmount, setTenderedAmount] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Split Payment State
  const [splitCash, setSplitCash] = useState<string>('');
  const [splitDigital, setSplitDigital] = useState<string>('');
  const [splitDigitalType, setSplitDigitalType] = useState<'bkash' | 'nagad' | 'card'>('bkash');

  const grandTotal = getGrandTotal();
  const tenderedNum = parseFloat(tenderedAmount) || 0;
  const changeAmount = Math.max(0, tenderedNum - grandTotal);
  const dueAmount = paymentMethod === 'due' ? grandTotal : 0;

  // Receipt Print ref
  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: completedOrder ? `Invoice-${completedOrder.orderNumber}` : 'Invoice',
  });

  const handleOpenModal = () => {
    setTenderedAmount(Math.ceil(grandTotal).toString());
    setCompletedOrder(null);
    setPaymentMethod('cash');
    setTransactionRef('');
  };

  React.useEffect(() => {
    if (isOpen) {
      handleOpenModal();
    }
  }, [isOpen, grandTotal]);

  const handleCompletePayment = async () => {
    if (items.length === 0) return;

    if (paymentMethod === 'due') {
      if (!customer || customer.id === 'cust-walkin') {
        showToast('Customer Required', 'Please select a registered customer to record due sale.', 'error');
        return;
      }
      if (customer.currentDue + grandTotal > customer.creditLimit) {
        showToast('Credit Limit Exceeded', `Credit limit is ${formatCurrency(customer.creditLimit, settings.currencySymbol)}.`, 'error');
        return;
      }
    }

    if (paymentMethod === 'cash' && tenderedNum < grandTotal) {
      showToast('Insufficient Cash', 'Tendered cash is less than the net payable amount.', 'warning');
      return;
    }

    setIsProcessing(true);

    try {
      let finalSplits: PaymentSplit[] | undefined = undefined;
      let finalPaid = tenderedNum;

      if (paymentMethod === 'split') {
        const cashVal = parseFloat(splitCash) || 0;
        const digVal = parseFloat(splitDigital) || 0;
        if (cashVal + digVal < grandTotal) {
          showToast('Incomplete Split Payment', 'Sum of split payments does not cover total amount.', 'error');
          setIsProcessing(false);
          return;
        }
        finalSplits = [
          { method: 'cash', amount: cashVal },
          { method: splitDigitalType, amount: digVal, transactionRef },
        ];
        finalPaid = cashVal + digVal;
      } else if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'card') {
        finalPaid = grandTotal;
      } else if (paymentMethod === 'due') {
        finalPaid = 0;
      }

      const orderData = {
        shiftId: currentShift?.id,
        cashierName: settings.cashierName,
        customerId: customer?.id,
        customerName: customer?.name || 'Walk-in Customer',
        customerPhone: customer?.phone,
        items,
        itemsCount: getTotalItemsCount(),
        subtotal: getSubtotal(),
        discountTotal: getDiscountTotal(),
        discountType,
        discountValue,
        taxTotal: getTaxTotal(),
        taxRatePercent: settings.enableTax ? settings.defaultTaxRate : 0,
        grandTotal,
        roundedTotal: Math.round(grandTotal),
        paidAmount: finalPaid,
        changeAmount: paymentMethod === 'cash' ? changeAmount : 0,
        dueAmount,
        paymentMethod,
        splitPayments: finalSplits,
        status: 'completed' as const,
      };

      const created = await OrderService.createOrder(orderData);
      setCompletedOrder(created);

      // Play Sound & Confetti
      soundManager.playCashRegisterSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      showToast('Sale Completed!', `Invoice #${created.orderNumber} generated successfully.`, 'success');

      // Auto-print receipt if enabled
      if (settings.autoPrintReceipt) {
        setTimeout(() => {
          handlePrint();
        }, 300);
      }
    } catch (err) {
      soundManager.playErrorBuzz();
      showToast('Checkout Failed', (err as Error).message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishAndNewSale = () => {
    clearCart();
    setCompletedOrder(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={completedOrder ? handleFinishAndNewSale : onClose}
      title={completedOrder ? 'Payment Successful' : 'Checkout & Payment'}
      maxWidth={completedOrder ? 'md' : '3xl'}
    >
      {completedOrder ? (
        /* Order Completion View */
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle className="h-10 w-10" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(completedOrder.grandTotal, settings.currencySymbol)} Paid
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
              Invoice #{completedOrder.orderNumber}
            </p>
          </div>

          {completedOrder.changeAmount > 0 && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Change to return:
              </span>
              <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-0.5">
                {formatCurrency(completedOrder.changeAmount, settings.currencySymbol)}
              </div>
            </div>
          )}

          {/* Hidden Printable Receipt component */}
          <div className="hidden">
            <ReceiptView ref={receiptRef} order={completedOrder} settings={settings} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => handlePrint()}
            >
              <Printer className="w-5 h-5 mr-2" />
              Re-Print Receipt
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleFinishAndNewSale}
            >
              Next Customer (New Sale)
            </Button>
          </div>
        </div>
      ) : (
        /* Active Payment Interface */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Payment Method Tabs & Inputs */}
          <div className="md:col-span-7 space-y-4">
            {/* Net Amount Banner */}
            <div className="rounded-2xl bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Total Payable
                </span>
                <div className="text-3xl font-black text-sky-400">
                  {formatCurrency(grandTotal, settings.currencySymbol)}
                </div>
              </div>
              <div className="text-right text-xs text-slate-300">
                <div>Items: <span className="font-bold">{getTotalItemsCount()}</span></div>
                {customer && <div>Customer: <span className="font-bold text-sky-300">{customer.name}</span></div>}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'bkash', label: 'bKash', icon: Smartphone },
                { id: 'nagad', label: 'Nagad', icon: Smartphone },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'split', label: 'Split', icon: Layers },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.id as PaymentMethod);
                      if (method.id === 'cash') {
                        setTenderedAmount(Math.ceil(grandTotal).toString());
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950 dark:text-sky-300 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1 text-current" />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Method Specific Inputs */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Tendered Cash:
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(tenderedNum, settings.currencySymbol)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Change to Return:
                  </span>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(changeAmount, settings.currencySymbol)}
                  </div>
                </div>
              </div>
            )}

            {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'card') && (
              <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Scan QR code or swipe card on POS terminal for full amount:
                </div>
                <div className="text-lg font-black text-sky-600 dark:text-sky-400">
                  {formatCurrency(grandTotal, settings.currencySymbol)}
                </div>
                <input
                  type="text"
                  placeholder="Transaction ID / Approval Code (Optional)..."
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            )}

            {paymentMethod === 'split' && (
              <div className="space-y-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Cash Amount ({settings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={splitCash}
                      onChange={(e) => setSplitCash(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Digital / Card ({settings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={splitDigital}
                      onChange={(e) => setSplitDigital(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {(['bkash', 'nagad', 'card'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSplitDigitalType(t)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border capitalize ${
                        splitDigitalType === t
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Touch Numpad & Submit Button */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <Numpad
              value={tenderedAmount}
              onChange={setTenderedAmount}
              targetAmount={grandTotal}
              currencySymbol={settings.currencySymbol}
            />

            <Button
              variant="success"
              size="xl"
              className="w-full h-14 text-base font-extrabold shadow-lg shadow-emerald-600/30"
              isLoading={isProcessing}
              onClick={handleCompletePayment}
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Complete & Print Bill (F9)
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
