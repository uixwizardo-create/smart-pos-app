import React from 'react';
import { Modal } from '../../../components/ui/Modal';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcuts = [
    { key: 'F1', desc: 'Open Keyboard Shortcuts Guide' },
    { key: 'F2', desc: 'Focus Product Search Bar' },
    { key: 'F4', desc: 'Hold / Park Active Cart' },
    { key: 'F8', desc: 'Select or Create Customer' },
    { key: 'F9', desc: 'Open Payment / Checkout Modal' },
    { key: 'Esc', desc: 'Close any open modal or dialog' },
    { key: 'Enter', desc: 'Instant Barcode Scanner trigger & Confirm' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cashier Keyboard Shortcuts (F1)"
      description="Speed up your billing checkout operations with keyboard hotkeys"
      maxWidth="md"
    >
      <div className="space-y-2.5">
        {shortcuts.map((sc) => (
          <div
            key={sc.key}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60"
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {sc.desc}
            </span>
            <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sky-600 dark:text-sky-400 shadow-2xs">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
};
