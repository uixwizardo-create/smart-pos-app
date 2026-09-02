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
  ChevronDown,
} from 'lucide-react';
import type { Customer, CustomerTransaction, StoreSettings } from '../../types';
import { CustomerService } from '../../services/customer.service';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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

  // Settle Due Modal
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [duePayAmount, setDuePayAmount] = useState('');
  const [duePayMethod, setDuePayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'card' | 'bank'>('cash');
  const [duePayNote, setDuePayNote] = useState('');

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('5000');
  const [initialDue, setInitialDue] = useState('0');

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

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    try {
      const created = await CustomerService.createCustomer({
        name: newName.trim(),
        phone: newPhone.trim(),
        address: newAddress.trim() || undefined,
        creditLimit: parseFloat(creditLimit) || 5000,
        initialDue: parseFloat(initialDue) || 0,
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

  const handleSettleDue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const amount = parseFloat(duePayAmount) || 0;
    if (amount <= 0) {
      showToast('Invalid Amount', 'Please enter a valid payment amount.', 'warning');
      return;
    }

    try {
      await CustomerService.recordDuePayment(
        selectedCustomer.id,
        amount,
        duePayMethod,
        duePayNote || undefined
      );

      showToast('Payment Recorded', `Received ${formatCurrency(amount, settings.currencySymbol)} from ${selectedCustomer.name}`, 'success');
      setDuePayAmount('');
      setDuePayNote('');
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
            Customer Due Ledger (বাকি খাতা)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track customer dues, credit limits, and loyalty points
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="rounded-2xl bg-rose-50 border border-rose-200/80 dark:bg-rose-950/40 dark:border-rose-800 px-3.5 py-1.5 text-right">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase block">
              Market Dues
            </span>
            <div className="text-sm sm:text-base font-black text-rose-800 dark:text-rose-200 font-mono">
              {formatCurrency(totalDueAmount, settings.currencySymbol)}
            </div>
          </div>

          <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Main Responsive Layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: Customer Directory */}
        <div className={`w-full lg:w-[360px] flex flex-col rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-sm overflow-hidden ${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-2xl border border-slate-200/80 bg-slate-50 pl-10 pr-3 text-xs sm:text-sm font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredCustomers.map((c) => {
              const isSelected = selectedCustomer?.id === c.id;
              const hasDue = c.currentDue > 0;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/60 dark:border-emerald-500 dark:bg-emerald-950/40 shadow-xs'
                      : 'border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {c.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{c.phone}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {hasDue ? (
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400 font-mono">
                          Due: {formatCurrency(c.currentDue, settings.currencySymbol)}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Clear
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Customer Profile & Ledger History */}
        {selectedCustomer && (
          <div className={`flex-1 flex flex-col rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-5 shadow-sm overflow-hidden ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
            {/* Mobile Back Button */}
            <div className="lg:hidden pb-2">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Customer List</span>
              </button>
            </div>

            {/* Customer Profile Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
                  {selectedCustomer.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedCustomer.phone}
                  </span>
                  {selectedCustomer.address && (
                    <span className="hidden sm:flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedCustomer.address}
                    </span>
                  )}
                  <span>Pts: <b className="text-emerald-600">{selectedCustomer.loyaltyPoints}</b></span>
                </div>
              </div>

              {/* Due Action Button */}
              {selectedCustomer.id !== 'cust-walkin' && (
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Due
                    </span>
                    <span className={`text-sm sm:text-xl font-black font-mono ${selectedCustomer.currentDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatCurrency(selectedCustomer.currentDue, settings.currencySymbol)}
                    </span>
                  </div>

                  {selectedCustomer.currentDue > 0 && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        setDuePayAmount(selectedCustomer.currentDue.toString());
                        setIsDueModalOpen(true);
                      }}
                    >
                      <DollarSign className="w-3.5 h-3.5 mr-1" />
                      Receive Payment
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Customer KPI Cards */}
            <div className="grid grid-cols-3 gap-2.5 py-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Spent
                </span>
                <div className="text-xs sm:text-base font-black text-slate-900 dark:text-white mt-0.5 truncate font-mono">
                  {formatCurrency(selectedCustomer.totalSpent, settings.currencySymbol)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Orders
                </span>
                <div className="text-xs sm:text-base font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                  {selectedCustomer.totalOrders}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Limit
                </span>
                <div className="text-xs sm:text-base font-black text-slate-900 dark:text-white mt-0.5 truncate font-mono">
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

      {/* Settle Due Modal */}
      <Modal
        isOpen={isDueModalOpen}
        onClose={() => setIsDueModalOpen(false)}
        title="Receive Customer Due Payment"
        maxWidth="sm"
      >
        <form onSubmit={handleSettleDue} className="space-y-3.5">
          <Input
            label={`Payment Amount (${settings.currencySymbol}) *`}
            type="number"
            required
            value={duePayAmount}
            onChange={(e) => setDuePayAmount(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Payment Method *
            </label>
            <div className="relative">
              <select
                value={duePayMethod}
                onChange={(e) => setDuePayMethod(e.target.value as typeof duePayMethod)}
                className="h-10 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-3.5 pr-9 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white cursor-pointer"
              >
                <option value="cash">Cash Counter</option>
                <option value="bkash">bKash Merchant</option>
                <option value="nagad">Nagad</option>
                <option value="card">Credit/Debit Card</option>
                <option value="bank">Bank Transfer</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <Input
            label="Note"
            value={duePayNote}
            onChange={(e) => setDuePayNote(e.target.value)}
            placeholder="e.g. Due settled"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDueModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Save Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add New Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        maxWidth="md"
      >
        <form onSubmit={handleAddCustomer} className="space-y-3.5">
          <Input
            label="Full Name *"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="Phone Number *"
            required
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <Input
            label="Address"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Credit Limit (৳)"
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
            />
            <Input
              label="Initial Due (৳)"
              type="number"
              value={initialDue}
              onChange={(e) => setInitialDue(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
