import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  DollarSign,
  History,
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

  // Settle Due Modal
  const [isDueModalOpen, setIsDueModalOpen] = useState(false);
  const [duePayAmount, setDuePayAmount] = useState('');
  const [duePayMethod, setDuePayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'card' | 'bank'>('cash');
  const [duePayNote, setDuePayNote] = useState('');

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
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
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    try {
      const created = await CustomerService.createCustomer({
        name: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
        address: newAddress.trim() || undefined,
        creditLimit: parseFloat(creditLimit) || 5000,
        initialDue: parseFloat(initialDue) || 0,
      });

      showToast('Customer Added', `${created.name} added successfully.`, 'success');
      await loadCustomers();
      setSelectedCustomer(created);
      setIsAddModalOpen(false);
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
    <div className="flex h-[calc(100vh-70px)] flex-col p-6 space-y-4 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-sky-600" />
            Customer CRM & Due Ledger (বাকি খাতা)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track customer dues, credit limits, transaction ledgers, and loyalty points
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 px-3.5 py-1.5 text-right">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase">
              Total Market Dues
            </span>
            <div className="text-base font-black text-rose-800 dark:text-rose-200">
              {formatCurrency(totalDueAmount, settings.currencySymbol)}
            </div>
          </div>

          <Button variant="primary" size="lg" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-5 h-5 mr-1.5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Customer List (Left) + Detailed Ledger (Right) */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: Customer Directory (40%) */}
        <div className="w-[380px] flex flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-xs overflow-hidden">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {c.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{c.phone}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {hasDue ? (
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                          Due: {formatCurrency(c.currentDue, settings.currencySymbol)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
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

        {/* Right: Selected Customer Profile & Ledger History (60%) */}
        {selectedCustomer ? (
          <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs overflow-hidden">
            {/* Customer Profile Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedCustomer.name}
                </h3>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedCustomer.phone}
                  </span>
                  {selectedCustomer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedCustomer.address}
                    </span>
                  )}
                  <span>Points: <b className="text-sky-600">{selectedCustomer.loyaltyPoints}</b></span>
                </div>
              </div>

              {/* Due Action Button */}
              {selectedCustomer.id !== 'cust-walkin' && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase font-bold block">
                      Outstanding Due
                    </span>
                    <span className={`text-xl font-black ${selectedCustomer.currentDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatCurrency(selectedCustomer.currentDue, settings.currencySymbol)}
                    </span>
                  </div>

                  {selectedCustomer.currentDue > 0 && (
                    <Button
                      variant="success"
                      size="md"
                      onClick={() => {
                        setDuePayAmount(selectedCustomer.currentDue.toString());
                        setIsDueModalOpen(true);
                      }}
                    >
                      <DollarSign className="w-4 h-4 mr-1" />
                      Receive Due Payment
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Customer KPI Cards */}
            <div className="grid grid-cols-3 gap-3 py-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Total Spent
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(selectedCustomer.totalSpent, settings.currencySymbol)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Total Completed Orders
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {selectedCustomer.totalOrders}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Credit Limit
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(selectedCustomer.creditLimit, settings.currencySymbol)}
                </div>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="flex-1 flex flex-col overflow-hidden pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4" />
                Ledger Transaction History
              </h4>

              <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300 font-bold uppercase">
                    <tr>
                      <th className="px-3 py-2.5">Date & Time</th>
                      <th className="px-3 py-2.5">Transaction Type</th>
                      <th className="px-3 py-2.5">Method</th>
                      <th className="px-3 py-2.5">Note</th>
                      <th className="px-3 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No transactions recorded for this customer yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => {
                        const isPayment = tx.type === 'payment_received';
                        return (
                          <tr key={tx.id}>
                            <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                              {formatDateTime(tx.createdAt)}
                            </td>
                            <td className="px-3 py-2 font-bold">
                              {isPayment ? (
                                <span className="text-emerald-600">Payment Received</span>
                              ) : (
                                <span className="text-rose-600">Due Recorded</span>
                              )}
                            </td>
                            <td className="px-3 py-2 uppercase text-slate-500">
                              {tx.paymentMethod || '—'}
                            </td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                              {tx.note || '—'}
                            </td>
                            <td className={`px-3 py-2 text-right font-black ${isPayment ? 'text-emerald-600' : 'text-rose-600'}`}>
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
        ) : null}
      </div>

      {/* Settle Due Modal */}
      <Modal
        isOpen={isDueModalOpen}
        onClose={() => setIsDueModalOpen(false)}
        title="Receive Customer Due Payment"
        description={`Record payment for ${selectedCustomer?.name}`}
        maxWidth="sm"
      >
        <form onSubmit={handleSettleDue} className="space-y-4">
          <Input
            label={`Payment Amount (${settings.currencySymbol}) *`}
            type="number"
            required
            value={duePayAmount}
            onChange={(e) => setDuePayAmount(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Payment Method *
            </label>
            <select
              value={duePayMethod}
              onChange={(e) => setDuePayMethod(e.target.value as typeof duePayMethod)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="cash">Cash Counter</option>
              <option value="bkash">bKash Merchant</option>
              <option value="nagad">Nagad</option>
              <option value="card">Credit/Debit Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <Input
            label="Transaction Note (Optional)"
            value={duePayNote}
            onChange={(e) => setDuePayNote(e.target.value)}
            placeholder="e.g. Partial due cleared"
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
        <form onSubmit={handleAddCustomer} className="space-y-3">
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
            label="Email Address"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
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
