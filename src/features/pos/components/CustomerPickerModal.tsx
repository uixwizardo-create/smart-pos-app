import React, { useState, useEffect } from 'react';
import { User, Phone, Search, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Customer, NewCustomerInput } from '../../../types';
import { CustomerService } from '../../../services/customer.service';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { formatCurrency } from '../../../utils/formatters';

interface CustomerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  currencySymbol?: string;
}

export const CustomerPickerModal: React.FC<CustomerPickerModalProps> = ({
  isOpen,
  onClose,
  selectedCustomer,
  onSelectCustomer,
  currencySymbol = '৳',
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('5000');
  const [initialDue, setInitialDue] = useState('0');

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    const data = await CustomerService.getAllCustomers();
    setCustomers(data);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const input: NewCustomerInput = {
      name: newName.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim(),
      creditLimit: parseFloat(creditLimit) || 5000,
      initialDue: parseFloat(initialDue) || 0,
    };

    const created = await CustomerService.createCustomer(input);
    await loadCustomers();
    onSelectCustomer(created);
    setShowAddForm(false);
    onClose();
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select or Add Customer"
      description="Attach a customer for loyalty points and due management (F8)"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Toggle between search & Add form */}
        <div className="flex items-center justify-between gap-2">
          {!showAddForm ? (
            <>
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer by name or mobile number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                New Customer
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Add New Customer Profile
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Back to List
              </Button>
            </div>
          )}
        </div>

        {/* Add Customer Form */}
        {showAddForm ? (
          <form onSubmit={handleCreateCustomer} className="space-y-3">
            <Input
              label="Full Name *"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Arif Chowdhury"
            />
            <Input
              label="Mobile Number *"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="017XXXXXXXX"
            />
            <Input
              label="Address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="House, Road, Area"
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
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save & Select
              </Button>
            </div>
          </form>
        ) : (
          /* Customer List */
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {filtered.map((customer) => {
              const isSelected = selectedCustomer?.id === customer.id;
              const hasDue = customer.currentDue > 0;

              return (
                <div
                  key={customer.id}
                  onClick={() => {
                    onSelectCustomer(customer);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/40'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {customer.name}
                        </h4>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-sky-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </span>
                        <span>•</span>
                        <span>Points: {customer.loyaltyPoints}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {hasDue ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                        <AlertTriangle className="w-3 h-3" />
                        Due: {formatCurrency(customer.currentDue, currencySymbol)}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        No Due
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
