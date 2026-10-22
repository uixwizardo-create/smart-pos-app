import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  DollarSign,
  History,
  ArrowLeft,
} from 'lucide-react';
import type { Customer, CustomerTransaction, StoreSettings } from '../../types';
import { CustomerService } from '../../services/customer.service';
import { Button } from '../../components/ui/Button';
import { AddCustomerModal } from './components/AddCustomerModal';
import { SettleDueModal } from './components/SettleDueModal';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useToastStore } from '../../store/useToastStore';

interface CustomerScreenProps {
  settings: StoreSettings;
}

export const CustomerScreen: React.FC<CustomerScreenProps> = ({ settings }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Modals
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const list = await CustomerService.getAllCustomers();
    setCustomers(list);
    if (list.length > 0 && !selectedCustomer) {
      setSelectedCustomer(list[0]);
      loadTransactions(list[0].id);
    } else if (selectedCustomer) {
      const updated = list.find((c) => c.id === selectedCustomer.id);
      if (updated) setSelectedCustomer(updated);
      loadTransactions(selectedCustomer.id);
    }
  };

  const loadTransactions = async (customerId: string) => {
    const txs = await CustomerService.getTransactionsByCustomerId(customerId);
    setTransactions(txs);
  };

  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    loadTransactions(c.id);
    setMobileView('detail');
  };

  const handleAddCustomer = async (data: {
    name: string;
    phone: string;
    address: string;
    creditLimit: number;
    initialDue: number;
  }) => {
    try {
      const created = await CustomerService.createCustomer({
        name: data.name,
        phone: data.phone,
        address: data.address || undefined,
        creditLimit: data.creditLimit,
        initialDue: data.initialDue,
      });

      showToast('Customer Added', `${created.name} added successfully.`, 'success');
      await loadCustomers();
      setSelectedCustomer(created);
      setIsAddModalOpen(false);
      setMobileView('detail');
    } catch (err) {
      showToast('Error', (err as Error).message, 'error');
    }
  };

  const handleSettleDue = async (
    amount: number,
    method: 'cash' | 'bkash' | 'nagad' | 'card' | 'bank',
    note: string
  ) => {
    if (!selectedCustomer) return;

    try {
      await CustomerService.recordDuePayment(
        selectedCustomer.id,
        amount,
        method,
        note || undefined
      );

      showToast(
        'Payment Recorded',
        `Received ${formatCurrency(amount, settings.currencySymbol)} from ${selectedCustomer.name}`,
        'success'
      );
      setIsDueModalOpen(false);
      await loadCustomers();
    } catch (err) {
      showToast('Error', (err as Error).message, 'error');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const totalDueAmount = customers.reduce((sum, c) => sum + c.currentDue, 0);

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 space-y-4 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Customer Due Khata (বাকির হিসাব)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track customer balances, credit limits, and receive due payments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 dark:border-rose-900/60 px-3.5 py-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              Total Market Due:
            </span>
            <span className="font-mono font-black text-rose-900 dark:text-rose-200 text-sm sm:text-base">
              {formatCurrency(totalDueAmount, settings.currencySymbol)}
            </span>
          </div>

          <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Customer</span>
          </Button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Customer List */}
        <div
          className={`lg:col-span-5 flex flex-col rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden ${
            mobileView === 'detail' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Search Box */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200/80 bg-slate-50 pl-9 pr-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Customer Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No registered customers found.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                const hasDue = c.currentDue > 0;

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCustomer(c)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {c.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {c.phone}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono font-black text-xs sm:text-sm ${
                          hasDue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                        }`}
                      >
                        {formatCurrency(c.currentDue, settings.currencySymbol)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Limit: {formatCurrency(c.creditLimit, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Details & Ledger */}
        {selectedCustomer && (
          <div
            className={`lg:col-span-7 flex flex-col rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden p-4 sm:p-5 space-y-4 ${
              mobileView === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Top Bar with Mobile Back */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="lg:hidden p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedCustomer.phone}
                    </span>
                    {selectedCustomer.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedCustomer.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedCustomer.currentDue > 0 && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setIsDueModalOpen(true)}
                  className="shrink-0"
                >
                  <DollarSign className="w-3.5 h-3.5 mr-1" />
                  Settle Due
                </Button>
              )}
            </div>

            {/* Quick Balances Grid */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/40 dark:border-rose-900/60 p-3.5">
                <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                  Outstanding Due
                </span>
                <div className="text-xl sm:text-2xl font-black text-rose-900 dark:text-rose-200 font-mono mt-1">
                  {formatCurrency(selectedCustomer.currentDue, settings.currencySymbol)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800/60 dark:border-slate-700 p-3.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Credit Limit
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
                  {formatCurrency(selectedCustomer.creditLimit, settings.currencySymbol)}
                </div>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="flex-1 flex flex-col overflow-hidden pt-1">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Ledger Transactions
              </h4>

              <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-xs text-slate-400 dark:bg-slate-800 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Type</th>
                      <th className="px-3 py-2.5 hidden sm:table-cell">Method</th>
                      <th className="px-3 py-2.5 hidden md:table-cell">Note</th>
                      <th className="px-3 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => {
                        const isPayment = tx.type === 'payment_received';
                        return (
                          <tr key={tx.id}>
                            <td className="px-3 py-2.5 text-[11px] text-slate-400 font-mono">
                              {formatDateTime(tx.createdAt)}
                            </td>
                            <td className="px-3 py-2.5 font-bold text-[11px]">
                              {isPayment ? (
                                <span className="text-emerald-600">Payment</span>
                              ) : (
                                <span className="text-rose-600">Due</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 uppercase text-[10px] text-slate-400 hidden sm:table-cell font-mono">
                              {tx.paymentMethod || '—'}
                            </td>
                            <td className="px-3 py-2.5 text-[11px] text-slate-500 hidden md:table-cell truncate max-w-[140px]">
                              {tx.note || '—'}
                            </td>
                            <td className={`px-3 py-2.5 text-right font-black text-[11px] font-mono ${isPayment ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isPayment ? '-' : '+'}
                              {formatCurrency(tx.amount, settings.currencySymbol)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settle Due Modal Component */}
      <SettleDueModal
        isOpen={isDueModalOpen}
        onClose={() => setIsDueModalOpen(false)}
        currencySymbol={settings.currencySymbol}
        onSettle={handleSettleDue}
      />

      {/* Add New Customer Modal Component */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currencySymbol={settings.currencySymbol}
        onSave={handleAddCustomer}
      />
    </div>
  );
};
