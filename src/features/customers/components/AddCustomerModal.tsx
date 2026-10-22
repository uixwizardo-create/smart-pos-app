import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onSave: (customerData: {
    name: string;
    phone: string;
    address: string;
    creditLimit: number;
    initialDue: number;
  }) => Promise<void>;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onSave,
}) => {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('5000');
  const [initialDue, setInitialDue] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        name: newName.trim(),
        phone: newPhone.trim(),
        address: newAddress.trim(),
        creditLimit: parseFloat(creditLimit) || 0,
        initialDue: parseFloat(initialDue) || 0,
      });
      setNewName('');
      setNewPhone('');
      setNewAddress('');
      setCreditLimit('5000');
      setInitialDue('0');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Customer"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Name *"
          required
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Karim Ahmed"
        />
        <Input
          label="Phone Number *"
          required
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="e.g. 01712345678"
        />
        <Input
          label="Address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="e.g. GEC Circle, Chattogram"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={`Credit Limit (${currencySymbol})`}
            type="number"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
          />
          <Input
            label={`Initial Due (${currencySymbol})`}
            type="number"
            value={initialDue}
            onChange={(e) => setInitialDue(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Customer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
