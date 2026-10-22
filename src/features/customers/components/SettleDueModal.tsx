import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface SettleDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onSettle: (amount: number, method: 'cash' | 'bkash' | 'nagad' | 'card' | 'bank', note: string) => Promise<void>;
}

export const SettleDueModal: React.FC<SettleDueModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onSettle,
}) => {
  const [duePayAmount, setDuePayAmount] = useState('');
  const [duePayMethod, setDuePayMethod] = useState<'cash' | 'bkash' | 'nagad' | 'card' | 'bank'>('cash');
  const [duePayNote, setDuePayNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(duePayAmount) || 0;
    if (amount <= 0) return;

    try {
      setIsSubmitting(true);
      await onSettle(amount, duePayMethod, duePayNote.trim());
      setDuePayAmount('');
      setDuePayNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Customer Due Payment"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label={`Payment Amount (${currencySymbol}) *`}
          type="number"
          required
          value={duePayAmount}
          onChange={(e) => setDuePayAmount(e.target.value)}
          placeholder="0.00"
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
          label="Payment Note"
          value={duePayNote}
          onChange={(e) => setDuePayNote(e.target.value)}
          placeholder="e.g. Partial due settled"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="success" isLoading={isSubmitting}>
            Save Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
